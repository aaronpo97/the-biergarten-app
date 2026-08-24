/**
 * @file main.cc
 * @brief Parses command-line options, validates runtime mode selection,
 * initializes shared infrastructure, and executes the pipeline entry flow.
 */

#include <spdlog/fmt/fmt.h>
#include <spdlog/spdlog.h>

#include <boost/di.hpp>
#include <boost/program_options.hpp>
#include <chrono>
#include <exception>
#include <format>
#include <iostream>
#include <memory>
#include <optional>
#include <string>
#include <thread>

#include "biergarten_pipeline.h"

namespace di = boost::di;

static constexpr size_t kLogMaxCount = 512;

int main(const int argc, char** argv) {
   spdlog::set_level(spdlog::level::debug);
   spdlog::set_pattern("│ %Y-%m-%d %H:%M:%S.%e │ %^%-7l%$ │ %v");
   BoundedChannel<LogEntry> log_channel(kLogMaxCount);

   auto log_dispatcher =  //
       std::make_unique<LogDispatcher>(log_channel);
   std::shared_ptr<ILogger> log_producer =
       std::make_shared<LogProducer>(log_channel);

   std::thread log_thread([&log_dispatcher] { log_dispatcher->Run(); });

   auto shutdown = [&](const int exit_code) {
      log_channel.Close();
      log_thread.join();
      return exit_code;
   };

   try {
      Timer timer;

#ifndef BIERGARTEN_MOCK_ONLY
      const LlamaBackendState llama_backend_state;
#endif

      log_producer->Log({.level = LogLevel::Info,
                         .phase = PipelinePhase::Startup,
                         .message = "STARTING PIPELINE"});

      const std::optional<ApplicationOptions> parsed_options =
          ParseArguments(argc, argv, log_producer);

      if (!parsed_options.has_value()) {
         return shutdown(EXIT_FAILURE);
      }

      const auto options = *parsed_options;
      const std::string model_path = options.generator.model_path.string();
      const auto sampling =
          options.generator.sampling.value_or(SamplingOptions{});

      std::unique_ptr<IPromptDirectory> prompt_directory;

      if (options.generator.mode != GeneratorMode::kMock) {
         try {
            prompt_directory = std::make_unique<PromptDirectory>(
                options.pipeline.prompt_dir, log_producer);
         } catch (const std::exception& dir_error) {
            log_producer->Log(
                {.level = LogLevel::Error,
                 .phase = PipelinePhase::Startup,
                 .message = std::format("Invalid --prompt-dir: {}",
                                        dir_error.what())});

            return shutdown(EXIT_FAILURE);
         }
      }

      const auto injector = di::make_injector(
          di::bind<ILogger>().to(log_producer),
          di::bind<ApplicationOptions>().to(options),
          di::bind<std::string>().to(model_path),
          di::bind<IExportService>().to<SqliteExportService>(),
          di::bind<ICuratedDataService>().to(
              [options,
               &log_producer]() -> std::unique_ptr<ICuratedDataService> {
                 if (options.generator.mode == GeneratorMode::kMock) {
                    log_producer->Log({.level = LogLevel::Info,
                                       .phase = PipelinePhase::Startup,
                                       .message = "Curated data: mock"});

                    return std::make_unique<MockCuratedDataService>();
                 }

                 log_producer->Log({.level = LogLevel::Info,
                                    .phase = PipelinePhase::Startup,
                                    .message = "Curated data: JsonLoader"});

                 return std::make_unique<CuratedJsonDataService>(
                     CuratedDataFilePaths{
                         .locations_path = "locations.json",
                         .personas_path = "personas.json",
                         .forenames_path = "forenames-by-country.json",
                         .surnames_path = "surnames-by-country.json",
                     });
              }),
          di::bind<IPromptFormatter>().to([options, log_producer] {
             if (options.generator.mode != GeneratorMode::kLlama) {
                log_producer->Log(
                    {.level = LogLevel::Info,
                     .phase = PipelinePhase::Startup,
                     .message = "Prompt formatter: none (not needed outside "
                                "Llama mode)"});
                return std::unique_ptr<IPromptFormatter>(nullptr);
             }
             {
                log_producer->Log(
                    {.level = LogLevel::Info,
                     .phase = PipelinePhase::Startup,
                     .message =
                         "Prompt formatter: Gemma4JinjaPromptFormatter"});
             }
             return std::unique_ptr<IPromptFormatter>(
                 std::make_unique<Gemma4JinjaPromptFormatter>());
          }),
          di::bind<WebClient>().to([options, log_producer] {
             if (options.generator.mode == GeneratorMode::kMock) {
                {
                   log_producer->Log(
                       {.level = LogLevel::Info,
                        .phase = PipelinePhase::Startup,
                        .message = "Web client: none (mock mode)"});
                }
                return std::unique_ptr<WebClient>(nullptr);
             }

             log_producer->Log({.level = LogLevel::Info,
                                .phase = PipelinePhase::Startup,
                                .message = "Web client: HttpWebClient"});

             return std::unique_ptr<WebClient>(
                 std::make_unique<HttpWebClient>(log_producer));
          }),
          di::bind<IEnrichmentService>().to(
              [options, &log_producer](
                  const auto& inj) -> std::unique_ptr<IEnrichmentService> {
                 if (options.generator.mode == GeneratorMode::kMock) {
                    log_producer->Log({.level = LogLevel::Info,
                                       .phase = PipelinePhase::Startup,
                                       .message = "Enrichment: mock"});

                    return std::make_unique<MockEnrichmentService>();
                 }

                 log_producer->Log({.level = LogLevel::Info,
                                    .phase = PipelinePhase::Startup,
                                    .message = "Enrichment: Wikipedia"});

                 return std::make_unique<WikipediaEnrichmentService>(
                     inj.template create<std::unique_ptr<WebClient>>(),
                     log_producer);
              }),
          di::bind<DataGenerator>().to([&options, &model_path, &sampling,
                                        &prompt_directory,
                                        &log_producer](const auto& inj)
                                           -> std::unique_ptr<DataGenerator> {
             if (options.generator.mode == GeneratorMode::kMock) {
                log_producer->Log({.level = LogLevel::Info,
                                   .phase = PipelinePhase::Startup,
                                   .message = "Generator: mock"});

                return std::make_unique<MockGenerator>();
             }

             if (options.generator.mode == GeneratorMode::kOpenAI) {
                log_producer->Log({.level = LogLevel::Info,
                                   .phase = PipelinePhase::Startup,
                                   .message = std::format(
                                       "Generator: OpenAIGenerator | model={}",
                                       options.generator.openai_model)});

                return std::make_unique<OpenAIGenerator>(
                    options.generator.openai_api_key,
                    options.generator.openai_model, log_producer,
                    std::move(prompt_directory),
                    inj.template create<std::unique_ptr<WebClient>>());
             }

#ifdef BIERGARTEN_MOCK_ONLY
             // Only reachable when mode == Llama, which requires llama.cpp and
             // is excluded from a BIERGARTEN_MOCK_ONLY build.
             throw std::runtime_error(
                 "LlamaGenerator is unavailable in a BIERGARTEN_MOCK_ONLY "
                 "build");
#else
             log_producer->Log(
                 {.level = LogLevel::Info,
                  .phase = PipelinePhase::Startup,
                  .message = std::format(
                      "Generator: LlamaGenerator | model={} | "
                      "temp={:.2f} top_p={:.2f} top_k={} n_ctx={} seed={}",
                      model_path, sampling.temperature, sampling.top_p,
                      sampling.top_k, sampling.n_ctx, sampling.seed)});

             return std::make_unique<LlamaGenerator>(
                 options, model_path, log_producer,
                 inj.template create<std::unique_ptr<IPromptFormatter>>(),
                 std::move(prompt_directory));
#endif
          }));

      const auto orchestrator =
          injector.create<std::unique_ptr<BiergartenPipelineOrchestrator>>();

      if (!orchestrator->Run()) {
         log_producer->Log({.level = LogLevel::Error,
                            .phase = PipelinePhase::Teardown,
                            .message = "Pipeline execution failed"});
         return shutdown(EXIT_FAILURE);
      }

      log_producer->Log({.level = LogLevel::Info,
                         .phase = PipelinePhase::Teardown,
                         .message = std::format("Pipeline complete in {} ms",
                                                timer.Elapsed())});

      return shutdown(EXIT_SUCCESS);
   } catch (const std::exception& exception) {
      const LogDTO log_entry{.level = LogLevel::Error,
                             .phase = PipelinePhase::Teardown,
                             .message = exception.what()};
      if (log_producer) {
         log_producer->Log(log_entry);
      } else {
         std::cerr << log_entry.message << std::endl;
      }

      return shutdown(EXIT_FAILURE);
   }
}
