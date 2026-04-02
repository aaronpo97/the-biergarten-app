#include <iostream>
#include <memory>

#include <boost/program_options.hpp>
#include <spdlog/spdlog.h>

#include "application_options.h"
#include "biergarten_data_generator.h"
#include "web_client/curl_web_client.h"
#include "database/database.h"

namespace po = boost::program_options;

/**
 * @brief Parse command-line arguments into ApplicationOptions.
 *
 * @param argc Command-line argument count.
 * @param argv Command-line arguments.
 * @param options Output ApplicationOptions struct.
 * @return true if parsing succeeded and help was not requested, false otherwise.
 */
bool ParseArguments(int argc, char **argv, ApplicationOptions &options) {
  po::options_description desc("Pipeline Options");
  desc.add_options()("help,h", "Produce help message")(
      "model,m", po::value<std::string>()->default_value(""),
      "Path to LLM model (gguf)")(
      "cache-dir,c", po::value<std::string>()->default_value("/tmp"),
      "Directory for cached JSON")(
      "temperature", po::value<float>()->default_value(0.8f),
      "Sampling temperature (higher = more random)")(
      "top-p", po::value<float>()->default_value(0.92f),
      "Nucleus sampling top-p in (0,1] (higher = more random)")(
      "seed", po::value<int>()->default_value(-1),
      "Sampler seed: -1 for random, otherwise non-negative integer")(
      "commit", po::value<std::string>()->default_value("c5eb7772"),
      "Git commit hash for DB consistency");

  po::variables_map vm;
  po::store(po::parse_command_line(argc, argv, desc), vm);
  po::notify(vm);

  if (vm.count("help")) {
    std::cout << desc << "\n";
    return false;
  }

  options.modelPath = vm["model"].as<std::string>();
  options.cacheDir = vm["cache-dir"].as<std::string>();
  options.temperature = vm["temperature"].as<float>();
  options.topP = vm["top-p"].as<float>();
  options.seed = vm["seed"].as<int>();
  options.commit = vm["commit"].as<std::string>();

  return true;
}

int main(int argc, char *argv[]) {
  try {
    const CurlGlobalState curl_state;

    ApplicationOptions options;
    if (!ParseArguments(argc, argv, options)) {
      return 0;
    }

    auto webClient = std::make_shared<CURLWebClient>();
    SqliteDatabase database;

    BiergartenDataGenerator generator(options, webClient, database);
    return generator.Run();

  } catch (const std::exception &e) {
    spdlog::error("ERROR: Application failed: {}", e.what());
    return 1;
  }
}
