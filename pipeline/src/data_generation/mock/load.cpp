/**
 * @file data_generation/mock/load.cpp
 * @brief Provides MockGenerator initialization behavior, which is a no-op load
 * path that logs readiness without model resources.
 */

#include <spdlog/spdlog.h>

#include <string>

#include "data_generation/mock_generator.h"

void MockGenerator::Load(const std::string& /*modelPath*/) {
   spdlog::info("[MockGenerator] No model needed");
}
