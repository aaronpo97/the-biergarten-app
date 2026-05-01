/**
 * @file main.cc
 * @brief Parses command-line options, validates runtime mode selection,
 * initializes shared infrastructure, and executes the pipeline entry flow.
 */

#include <spdlog/spdlog.h>

#include <boost/di.hpp>
#include <boost/program_options.hpp>
#include <chrono>
#include <cstdint>
#include <exception>
#include <memory>
#include <optional>
#include <sstream>
#include <string>

#include "biergarten_data_generator.h"
#include "data_generation/llama_generator.h"
#include "data_generation/mock_generator.h"
#include "data_generation/prompt_formatting/gemma4_jinja_prompt_formatter.h"
#include "data_model/application_options.h"
#include "llama_backend_state.h"
#include "services/enrichment_service.h"
#include "services/export_service.h"
#include "services/prompt_directory.h"
#include "services/sqlite_export_service.h"
#include "services/wikipedia_service.h"
#include "web_client/curl_web_client.h"

namespace prog_opts = boost::program_options;
namespace di = boost::di;

/**
 * @brief Parse command-line arguments into ApplicationOptions.
 *
 * @param argc Command-line argument count.
 * @param argv Command-line arguments.
 * @return Parsed ApplicationOptions if parsing succeeded, std::nullopt
 * otherwise.
 */
std::optional<ApplicationOptions> ParseArguments(const int argc, char** argv) {
  prog_opts::options_description desc("Pipeline Options");

  auto opt = desc.add_options();

  opt("help,h", "Produce help message");

  // Generator Options
  opt("mocked", prog_opts::bool_switch(),
      "Use mocked generator for brewery/user data");
  opt("model,m", prog_opts::value<std::string>()->default_value(""),
      "Path to LLM model (gguf)");

  // Sampling Options - defaults driven from SamplingOptions struct
  const SamplingOptions kSamplingDefaults{};
  opt("temperature",
      prog_opts::value<float>()->default_value(kSamplingDefaults.temperature),
      "Sampling temperature (higher = more random)");
  opt("top-p",
      prog_opts::value<float>()->default_value(kSamplingDefaults.top_p),
      "Nucleus sampling top-p in (0,1] (higher = more random)");
  opt("top-k",
      prog_opts::value<uint32_t>()->default_value(kSamplingDefaults.top_k),
      "Top-k sampling parameter (higher = more candidate tokens)");
  opt("n-ctx",
      prog_opts::value<uint32_t>()->default_value(kSamplingDefaults.n_ctx),
      "Context window size in tokens");
  opt("seed", prog_opts::value<int>()->default_value(kSamplingDefaults.seed),
      "Sampler seed: -1 for random, otherwise non-negative integer");

  // Pipeline Options
  opt("output,o", prog_opts::value<std::string>()->default_value("output"),
      "Directory for generated artifacts");
  opt("log-path",
      prog_opts::value<std::string>()->default_value("pipeline.log"),
      "Path for application logs");
  opt("prompt-dir", prog_opts::value<std::string>()->default_value(""),
      "Directory containing named prompt files (e.g. BREWERY_GENERATION.md)."
      " Required when not using --mocked.");

  if (argc == 1) {
    spdlog::info("Biergarten Pipeline");
    std::stringstream usage_stream;
    usage_stream << "\nUsage: biergarten-pipeline [options]\n\n" << desc;
    spdlog::info(usage_stream.str());
    return std::nullopt;
  }

  try {
    prog_opts::variables_map var_map;
    prog_opts::store(prog_opts::parse_command_line(argc, argv, desc), var_map);
    prog_opts::notify(var_map);

    if (var_map.contains("help")) {
      std::stringstream help_stream;
      help_stream << "\n" << desc;
      spdlog::info(help_stream.str());
      return std::nullopt;
    }

    ApplicationOptions options;

    options.pipeline.output_path = var_map["output"].as<std::string>();
    options.pipeline.log_path = var_map["log-path"].as<std::string>();
    options.pipeline.prompt_dir = var_map["prompt-dir"].as<std::string>();

    const bool use_mocked = var_map["mocked"].as<bool>();
    const std::string model_path = var_map["model"].as<std::string>();

    if (use_mocked && !model_path.empty()) {
      spdlog::error(
          "Invalid arguments: --mocked and --model are mutually exclusive");
      return std::nullopt;
    }

    if (!use_mocked && model_path.empty()) {
      spdlog::error(
          "Invalid arguments: Either --mocked or --model must be specified");
      return std::nullopt;
    }

    if (!use_mocked && options.pipeline.prompt_dir.empty()) {
      spdlog::error(
          "Invalid arguments: --prompt-dir is required when not using "
          "--mocked");
      return std::nullopt;
    }

    options.generator.use_mocked = use_mocked;
    options.generator.model_path = model_path;

    const bool user_provided_sampling =
        !var_map["temperature"].defaulted() || !var_map["top-p"].defaulted() ||
        !var_map["top-k"].defaulted() || !var_map["n-ctx"].defaulted() ||
        !var_map["seed"].defaulted();

    if (use_mocked) {
      if (user_provided_sampling) {
        spdlog::warn("Sampling parameters are ignored when using --mocked");
      }
    } else if (user_provided_sampling) {
      SamplingOptions sampling;
      sampling.temperature = var_map["temperature"].as<float>();
      sampling.top_p = var_map["top-p"].as<float>();
      sampling.top_k = var_map["top-k"].as<uint32_t>();
      sampling.n_ctx = var_map["n-ctx"].as<uint32_t>();
      sampling.seed = var_map["seed"].as<int>();

      options.generator.sampling = sampling;
    }

    return options;
  } catch (const std::exception& exception) {
    spdlog::error("Failed to parse command-line arguments: {}",
                  exception.what());
    return std::nullopt;
  } catch (...) {
    spdlog::error("Failed to parse command-line arguments: unknown error");
    return std::nullopt;
  }
}

struct Timer {
  std::chrono::steady_clock::time_point start_time =
      std::chrono::steady_clock::now();
  [[nodiscard]] int64_t Elapsed() const {
    return std::chrono::duration_cast<std::chrono::milliseconds>(
               std::chrono::steady_clock::now() - start_time)
        .count();
  }
};

int main(const int argc, char** argv) {
  try {
    Timer timer;
    const CurlGlobalState curl_state;
    const LlamaBackendState llama_backend_state;
    spdlog::set_pattern("[%Y-%m-%d %H:%M:%S.%e] [%^%l%$] %v");

    const auto parsed_options = ParseArguments(argc, argv);
    if (!parsed_options.has_value()) {
      return 0;
    }

    const auto options = *parsed_options;
    const std::string model_path = options.generator.model_path.string();
    const auto sampling =
        options.generator.sampling.value_or(SamplingOptions{});

    std::unique_ptr<IPromptDirectory> prompt_directory;
    if (!options.generator.use_mocked) {
      try {
        prompt_directory =
            std::make_unique<PromptDirectory>(options.pipeline.prompt_dir);
      } catch (const std::exception& dir_error) {
        spdlog::error("[Startup] Invalid --prompt-dir: {}", dir_error.what());
        return 1;
      }
    }

    const auto injector = di::make_injector(
        di::bind<WebClient>().to<CURLWebClient>(),
        di::bind<ApplicationOptions>().to(options),
        di::bind<IEnrichmentService>().to<WikipediaService>(),
        di::bind<IExportService>().to<SqliteExportService>(),
        di::bind<IPromptFormatter>().to<Gemma4JinjaPromptFormatter>(),
        di::bind<std::string>().to(model_path),
        di::bind<DataGenerator>().to(
            [options, model_path, sampling, &prompt_directory](
                const auto& inj) -> std::unique_ptr<DataGenerator> {
              if (options.generator.use_mocked) {
                spdlog::info(
                    "[Generator] Using MockGenerator (no model path provided)");
                return std::make_unique<MockGenerator>();
              }

              spdlog::info(
                  "[Generator] Using LlamaGenerator: {} (temperature={}, "
                  "top-p={}, top-k={}, n_ctx={}, seed={})",
                  model_path, sampling.temperature, sampling.top_p,
                  sampling.top_k, sampling.n_ctx, sampling.seed);
              return std::make_unique<LlamaGenerator>(
                  options, model_path,
                  inj.template create<std::unique_ptr<IPromptFormatter>>(),
                  std::move(prompt_directory));
            }));

    auto generator =
        injector.create<std::unique_ptr<BiergartenDataGenerator>>();

    if (!generator->Run()) {
      spdlog::error("Pipeline execution failed");
      return 1;
    }

    spdlog::info("Pipeline executed successfully in {} ms", timer.Elapsed());
    return 0;
  } catch (const std::exception& exception) {
    spdlog::critical("Unhandled fatal error in main: {}", exception.what());
    return 1;
  }
}
