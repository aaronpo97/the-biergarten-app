#include <iostream>
#include <memory>

#include <boost/program_options.hpp>
#include <spdlog/spdlog.h>

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
 * @return true if parsing succeeded and should proceed, false otherwise.
 */
bool ParseArguments(int argc, char **argv, ApplicationOptions &options) {
  // If no arguments provided, display usage and exit
  if (argc == 1) {
    std::cout << "Biergarten Pipeline - Geographic Data Pipeline with Brewery Generation\n\n";
    std::cout << "Usage: biergarten-pipeline [options]\n\n";
    std::cout << "Options:\n";
    std::cout << "  --mocked             Use mocked generator for brewery/user data\n";
    std::cout << "  --model, -m PATH     Path to LLM model file (gguf) for generation\n";
    std::cout << "  --cache-dir, -c DIR  Directory for cached JSON (default: /tmp)\n";
    std::cout << "  --temperature TEMP   LLM sampling temperature 0.0-1.0 (default: 0.8)\n";
    std::cout << "  --top-p VALUE        Nucleus sampling parameter 0.0-1.0 (default: 0.92)\n";
    std::cout << "  --seed SEED          Random seed: -1 for random (default: -1)\n";
    std::cout << "  --help, -h           Show this help message\n\n";
    std::cout << "Note: --mocked and --model are mutually exclusive. Exactly one must be provided.\n";
    std::cout << "Data source is always pinned to commit c5eb7772 (stable 2026-03-28).\n";
    return false;
  }

  po::options_description desc("Pipeline Options");
  desc.add_options()("help,h", "Produce help message")(
      "mocked", po::bool_switch(),
      "Use mocked generator for brewery/user data")(
      "model,m", po::value<std::string>()->default_value(""),
      "Path to LLM model (gguf)")(
      "cache-dir,c", po::value<std::string>()->default_value("/tmp"),
      "Directory for cached JSON")(
      "temperature", po::value<float>()->default_value(0.8f),
      "Sampling temperature (higher = more random)")(
      "top-p", po::value<float>()->default_value(0.92f),
      "Nucleus sampling top-p in (0,1] (higher = more random)")(
      "seed", po::value<int>()->default_value(-1),
      "Sampler seed: -1 for random, otherwise non-negative integer");

  po::variables_map vm;
  po::store(po::parse_command_line(argc, argv, desc), vm);
  po::notify(vm);

  if (vm.count("help")) {
    std::cout << desc << "\n";
    return false;
  }

  // Check for mutually exclusive --mocked and --model flags
  bool use_mocked = vm["mocked"].as<bool>();
  std::string model_path = vm["model"].as<std::string>();

  if (use_mocked && !model_path.empty()) {
    spdlog::error("ERROR: --mocked and --model are mutually exclusive");
    return false;
  }

  if (!use_mocked && model_path.empty()) {
    spdlog::error("ERROR: Either --mocked or --model must be specified");
    return false;
  }

  // Warn if sampling parameters are provided with --mocked
  if (use_mocked) {
    bool hasTemperature = vm["temperature"].defaulted() == false;
    bool hasTopP = vm["top-p"].defaulted() == false;
    bool hasSeed = vm["seed"].defaulted() == false;

    if (hasTemperature || hasTopP || hasSeed) {
      spdlog::warn("WARNING: Sampling parameters (--temperature, --top-p, --seed) are ignored when using --mocked");
    }
  }

  options.use_mocked = use_mocked;
  options.model_path = model_path;
  options.cache_dir = vm["cache-dir"].as<std::string>();
  options.temperature = vm["temperature"].as<float>();
  options.top_p = vm["top-p"].as<float>();
  options.seed = vm["seed"].as<int>();
  // commit is always pinned to c5eb7772

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
