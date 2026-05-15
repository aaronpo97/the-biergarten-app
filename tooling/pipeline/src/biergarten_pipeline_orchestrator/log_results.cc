/**
 * @file biergarten_pipeline_orchestrator/log_results.cc
 * @brief BiergartenDataGenerator::LogResults() implementation.
 */

#include "services/logging/logger.h"

#include "biergarten_pipeline_orchestrator.h"
#include <sstream>

void BiergartenPipelineOrchestrator::LogResults() const {
  std::ostringstream msg;
  msg << "GENERATED DATA DUMP\n";
  size_t index = 1;
  for (const auto& [location, brewery] : generated_breweries_) {
    msg << index << ". city=\"" << location.city << "\" country=\""
        << location.country << "\" state=\"" << location.state_province
        << "\" iso3166_2=" << location.iso3166_2 << " lat="
        << location.latitude << " lon=" << location.longitude << "\n";

    msg << "   brewery_name_en=\"" << brewery.name_en << "\"\n";
    msg << "   brewery_description_en=\"" << brewery.description_en
        << "\"\n";
    msg << "   brewery_name_local=\"" << brewery.name_local << "\"\n";
    msg << "   brewery_description_local=\"" << brewery.description_local
        << "\"\n";
    ++index;
  }

  logger_->Log(LogLevel::Debug, PipelinePhase::Teardown, msg.str());
}
