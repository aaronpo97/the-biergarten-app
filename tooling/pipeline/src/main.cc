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
#include "services/timer.h"
#include "services/wikipedia_service.h"
#include "web_client/curl_web_client.h"

namespace di = boost::di;

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
