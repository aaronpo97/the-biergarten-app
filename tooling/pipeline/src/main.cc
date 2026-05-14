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
#include <thread>

#include "biergarten_data_generator.h"
#include "concurrency/bounded_channel.h"
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
#include "services/logging/channel_logger.h"
#include "services/logging/log_consumer.h"
#include "services/logging/log_entry.h"
#include "services/logging/logger.h"
#include "services/prompting/prompt_directory.h"
#include "web_client/http_web_client.h"

namespace di = boost::di;

static constexpr size_t kLogMaxCount = 512;
int main(const int argc, char** argv) {
  auto log_channel = std::make_shared<BoundedChannel<LogEntry>>(kLogMaxCount);
  ChannelLogger channel_logger(*log_channel);
  LogConsumer log_worker(*log_channel);
  std::thread log_thread([&log_worker] { log_worker.Run(); });

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
      log_channel->Close();
      log_thread.join();
      return 0;
    }

    const auto options = *parsed_options;
    const std::string model_path = options.generator.model_path.string();
    const auto sampling =
        options.generator.sampling.value_or(SamplingOptions{});

    // -----------------------------------------------------------------------
    // Prompt directory
    // Conditionally constructed before the injector; moved into LlamaGenerator.
    // -----------------------------------------------------------------------
    std::unique_ptr<IPromptDirectory> prompt_directory;
    if (!options.generator.use_mocked) {
      try {
        prompt_directory =
            std::make_unique<PromptDirectory>(options.pipeline.prompt_dir);
      } catch (const std::exception& dir_error) {
        channel_logger.Log(
            LogLevel::Error, PipelinePhase::Startup,
            std::string("Invalid --prompt-dir: ") + dir_error.what());
        log_channel->Close();
        log_thread.join();
        return 1;
      }
    }

    // -----------------------------------------------------------------------
    // Dependency injection
    // -----------------------------------------------------------------------
    const auto injector = di::make_injector(
        di::bind<ApplicationOptions>().to(options),
        di::bind<std::string>().to(model_path),
        di::bind<WebClient>().to<HttpWebClient>(),
        di::bind<IExportService>().to<SqliteExportService>(),
        di::bind<IPromptFormatter>().to<Gemma4JinjaPromptFormatter>(),
        di::bind<ILogger>().to(
            [log_channel](const auto&) -> std::unique_ptr<ILogger> {
              return std::make_unique<ChannelLogger>(*log_channel);
            }),
        di::bind<IEnrichmentService>().to(
            [options](const auto& inj) -> std::unique_ptr<IEnrichmentService> {
              if (options.generator.use_mocked) {
                return std::make_unique<MockEnrichmentService>();
              }
              return std::make_unique<WikipediaEnrichmentService>(
                  inj.template create<std::unique_ptr<WebClient>>());
            }),
        di::bind<DataGenerator>().to(
            [&options, &model_path, &sampling, &prompt_directory,
             &channel_logger](
                const auto& inj) -> std::unique_ptr<DataGenerator> {
              if (options.generator.use_mocked) {
                channel_logger.Log(
                    LogLevel::Info, PipelinePhase::Startup,
                    "Using MockGenerator (no model path provided)");
                return std::make_unique<MockGenerator>();
              }
              channel_logger.Log(
                  LogLevel::Info, PipelinePhase::Startup,
                  "Using LlamaGenerator: " + model_path +
                      " (temperature=" + std::to_string(sampling.temperature) +
                      ", top-p=" + std::to_string(sampling.top_p) +
                      ", top-k=" + std::to_string(sampling.top_k) +
                      ", n_ctx=" + std::to_string(sampling.n_ctx) +
                      ", seed=" + std::to_string(sampling.seed) + ")");
              return std::make_unique<LlamaGenerator>(
                  options, model_path,
                  inj.template create<std::unique_ptr<IPromptFormatter>>(),
                  std::move(prompt_directory));
            }));

    // -----------------------------------------------------------------------
    // Pipeline execution
    // -----------------------------------------------------------------------
    const auto orchestrator =
        injector.create<std::unique_ptr<BiergartenPipelineOrchestrator>>();

    if (!orchestrator->Run()) {
      channel_logger.Log(LogLevel::Error, PipelinePhase::Teardown,
                         "Pipeline execution failed");
      log_channel->Close();
      log_thread.join();
      return 1;
    }

    channel_logger.Log(LogLevel::Info, PipelinePhase::Teardown,
                       "Pipeline executed successfully in " +
                           std::to_string(timer.Elapsed()) + " ms");

    log_channel->Close();
    log_thread.join();
    return 0;

  } catch (const std::exception& exception) {
    // Channel may be in an unknown state; fall back to spdlog directly.
    spdlog::critical("Unhandled fatal error in main: {}", exception.what());
    log_channel->Close();
    log_thread.join();
    return 1;
  }
}