#include <spdlog/spdlog.h>

#include <string>

#include "data_generation/mock_generator.h"

void MockGenerator::Load(const std::string& /*modelPath*/) {
   spdlog::info("[MockGenerator] No model needed");
}
