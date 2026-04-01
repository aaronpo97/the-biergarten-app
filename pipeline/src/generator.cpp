#include "generator.h"
#include <functional>
#include <spdlog/spdlog.h>

void LlamaBreweryGenerator::LoadModel(const std::string &modelPath) {
  spdlog::info("  [Mock] Initialized llama model: {}", modelPath);
  spdlog::info("    OK: Model ready");
}

LlamaBreweryGenerator::Brewery
LlamaBreweryGenerator::GenerateBrewery(const std::string &cityName, int seed) {
  // Deterministic mock generation for stable test output.
  size_t nameHash = std::hash<std::string>{}(cityName + std::to_string(seed));

  Brewery result;
  result.name = breweryAdjectives[nameHash % breweryAdjectives.size()] + " " +
                breweryNouns[(nameHash / 7) % breweryNouns.size()];
  result.description = descriptions[(nameHash / 13) % descriptions.size()];

  return result;
}
