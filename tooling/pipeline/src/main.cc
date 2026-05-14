/**
 * @file main.cc
 * @brief Parses command-line options, validates runtime mode selection,
 * initializes shared infrastructure, and executes the pipeline entry flow.
 */

#include <spdlog/spdlog.h>

#include <boost/di.hpp>
#include <boost/program_options.hpp>
#include <exception>
#include <memory>
#include <optional>
#include <string>

#include "biergarten_data_generator.h"
#include "data_generation/llama_generator.h"
#include "data_generation/mock_generator.h"
#include "data_generation/prompt_formatting/gemma4_jinja_prompt_formatter.h"
#include "data_model/models.h"
#include "llama_backend_state.h"
#include "services/database/export_service.h"
#include "services/database/sqlite_export_service.h"
#include "services/datetime/timer.h"
#include "services/enrichment/enrichment_service.h"
#include "services/enrichment/mock_enrichment.h"
#include "services/enrichment/wikipedia_service.h"
#include "services/prompting/prompt_directory.h"
#include "web_client/http_web_client.h"

namespace di = boost::di;

int main(const int argc, char** argv) {
  try {
    Timer timer;
    spdlog::set_pattern("[%Y-%m-%d %H:%M:%S.%e] [%^%l%$] %v");

#ifndef BIERGARTEN_MOCK_ONLY
    const LlamaBackendState llama_backend_state;
#endif
#ifdef DEBUG
    spdlog::set_level(spdlog::level::debug);
#endif

    const std::optional<ApplicationOptions> parsed_options =
        ParseArguments(argc, argv);

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
        di::bind<ApplicationOptions>().to(options),
        di::bind<std::string>().to(model_path),
        di::bind<WebClient>().to<HttpWebClient>(),
        di::bind<IExportService>().to<SqliteExportService>(),
        di::bind<IPromptFormatter>().to<Gemma4JinjaPromptFormatter>(),
        di::bind<IEnrichmentService>().to(
            [options](const auto& inj) -> std::unique_ptr<IEnrichmentService> {
              if (options.generator.use_mocked) {
                return std::make_unique<MockEnrichmentService>();
              }

              return std::make_unique<WikipediaEnrichmentService>(
                  inj.template create<std::unique_ptr<WebClient>>());
            }),
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
            })

    );

    const auto generator =
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
