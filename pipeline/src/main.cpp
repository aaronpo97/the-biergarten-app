/**
 * @file main.cpp
 * @brief Parses command-line options, validates runtime mode selection,
 * initializes shared infrastructure, and executes the pipeline entry flow.
 */

#include <spdlog/spdlog.h>

#include <boost/di.hpp>
#include <boost/program_options.hpp>
#include <exception>
#include <memory>
#include <sstream>
#include <string>

#include "biergarten_data_generator.h"
#include "data_generation/llama_generator.h"
#include "data_generation/mock_generator.h"
#include "services/enrichment_service.h"
#include "services/wikipedia_service.h"
#include "web_client/curl_web_client.h"

namespace prog_opts = boost::program_options;
namespace di = boost::di;

/**
 * @brief Parse command-line arguments into ApplicationOptions.
 *
 * @param argc Command-line argument count.
 * @param argv Command-line arguments.
 * @param options Output ApplicationOptions struct.
 * @return true if parsing succeeded and should proceed, false otherwise.
 */
auto ParseArguments(const int argc, char** argv,
                    ApplicationOptions& options) noexcept -> bool {
   prog_opts::options_description desc("Pipeline Options");
   desc.add_options()("help,h", "Produce help message")(
       "mocked", prog_opts::bool_switch(),
       "Use mocked generator for brewery/user data")(
       "model,m", prog_opts::value<std::string>()->default_value(""),
       "Path to LLM model (gguf)")(
       "temperature", prog_opts::value<float>()->default_value(0.8f),
       "Sampling temperature (higher = more random)")(
       "top-p", prog_opts::value<float>()->default_value(0.92f),
       "Nucleus sampling top-p in (0,1] (higher = more random)")(
       "n-ctx", prog_opts::value<uint32_t>()->default_value(8192),
       "Context window size in tokens (1-32768)")(
       "seed", prog_opts::value<int>()->default_value(-1),
       "Sampler seed: -1 for random, otherwise non-negative integer");

   // Handle the "no arguments" or "help" case
   if (argc == 1) {
      spdlog::info("Biergarten Pipeline");
      std::stringstream usage_stream;
      usage_stream << "\nUsage: biergarten-pipeline [options]\n\n" << desc;
      spdlog::info(usage_stream.str());
      return false;
   }

   try {
      prog_opts::variables_map variables_map;
      prog_opts::store(prog_opts::parse_command_line(argc, argv, desc),
                       variables_map);
      prog_opts::notify(variables_map);

      if (variables_map.contains("help")) {
         std::stringstream help_stream;
         help_stream << "\n" << desc;
         spdlog::info(help_stream.str());
         return false;
      }

      const auto use_mocked = variables_map["mocked"].as<bool>();
      const auto model_path = variables_map["model"].as<std::string>();

      if (use_mocked && !model_path.empty()) {
         spdlog::error(
             "Invalid arguments: --mocked and --model are mutually exclusive");
         return false;
      }

      if (!use_mocked && model_path.empty()) {
         spdlog::error(
             "Invalid arguments: Either --mocked or --model must be specified");
         return false;
      }

      const bool has_llm_params = !variables_map["temperature"].defaulted() ||
                                  !variables_map["top-p"].defaulted() ||
                                  !variables_map["seed"].defaulted();

      if (use_mocked && has_llm_params) {
         spdlog::warn(
             "Sampling parameters (--temperature, --top-p, --seed) are"
             " ignored when using --mocked");
      }

      options.use_mocked = use_mocked;
      options.model_path = model_path;
      options.temperature = variables_map["temperature"].as<float>();
      options.top_p = variables_map["top-p"].as<float>();
      options.n_ctx = variables_map["n-ctx"].as<uint32_t>();
      options.seed = variables_map["seed"].as<int>();

      return true;
   } catch (const std::exception& exception) {
      spdlog::error("Failed to parse command-line arguments: {}",
                    exception.what());
      return false;
   } catch (...) {
      spdlog::error("Failed to parse command-line arguments: unknown error");
      return false;
   }
}

auto main(const int argc, char** argv) noexcept -> int {
   try {
      const CurlGlobalState curl_state;
      spdlog::set_pattern("[%Y-%m-%d %H:%M:%S.%e] [%^%l%$] %v");

      ApplicationOptions options;
      if (!ParseArguments(argc, argv, options)) {
         return 0;
      }

      const auto injector = di::make_injector(
          di::bind<WebClient>().to<CURLWebClient>(),
          di::bind<ApplicationOptions>().to(options),
          di::bind<IEnrichmentService>().to<WikipediaService>(),
          di::bind<std::string>().to(options.model_path),
          di::bind<DataGenerator>().to([options](const auto& injector)
                                           -> std::unique_ptr<DataGenerator> {
             if (options.use_mocked) {
                spdlog::info(
                    "[Generator] Using MockGenerator (no model path provided)");
                return std::make_unique<MockGenerator>();
             }

             spdlog::info(
                 "[Generator] Using LlamaGenerator: {} (temperature={}, "
                 "top-p={}, "
                 "n_ctx={}, seed={})",
                 options.model_path, options.temperature, options.top_p,
                 options.n_ctx, options.seed);
             return injector.template create<std::unique_ptr<LlamaGenerator>>();
          }));

      auto generator = injector.create<BiergartenDataGenerator>();

      if (!generator.Run()) {
         spdlog::error("Pipeline execution failed");
         return 1;
      }

      spdlog::info("Pipeline executed successfully");
      return 0;
   } catch (const std::exception& exception) {
      spdlog::critical("Unhandled fatal error in main: {}", exception.what());
      return 1;
   } catch (...) {
      spdlog::critical("Unhandled fatal non-standard exception in main");
      return 1;
   }
}
