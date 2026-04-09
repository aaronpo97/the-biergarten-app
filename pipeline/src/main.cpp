/**
 * @file main.cpp
 * @brief Parses command-line options, validates runtime mode selection,
 * initializes shared infrastructure, and executes the pipeline entry flow.
 */

#include <spdlog/spdlog.h>

#include <boost/program_options.hpp>
#include <exception>
#include <memory>
#include <string>

#include "biergarten_data_generator.h"
#include "web_client/curl_web_client.h"

namespace prog_opts = boost::program_options;

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
      std::stringstream ss;
      ss << "\nUsage: biergarten-pipeline [options]\n\n" << desc;
      spdlog::info(ss.str());
      return false;
   }

   try {
      prog_opts::variables_map vm;
      prog_opts::store(prog_opts::parse_command_line(argc, argv, desc), vm);
      prog_opts::notify(vm);

      if (vm.contains("help")) {
         std::stringstream ss;
         ss << "\n" << desc;
         spdlog::info(ss.str());
         return false;
      }

      const auto use_mocked = vm["mocked"].as<bool>();
      const auto model_path = vm["model"].as<std::string>();

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

      const bool has_llm_params = !vm["temperature"].defaulted() ||
                                  !vm["top-p"].defaulted() ||
                                  !vm["seed"].defaulted();

      if (use_mocked && has_llm_params) {
         spdlog::warn(
             "Sampling parameters (--temperature, --top-p, --seed) are"
             " ignored when using --mocked");
      }

      options.use_mocked = use_mocked;
      options.model_path = model_path;
      options.temperature = vm["temperature"].as<float>();
      options.top_p = vm["top-p"].as<float>();
      options.n_ctx = vm["n-ctx"].as<uint32_t>();
      options.seed = vm["seed"].as<int>();

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

      auto webClient = std::make_shared<CURLWebClient>();
      BiergartenDataGenerator generator(options, std::move(webClient));

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
