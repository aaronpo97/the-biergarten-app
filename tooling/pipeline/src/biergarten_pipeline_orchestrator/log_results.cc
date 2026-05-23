/**
 * @file biergarten_pipeline_orchestrator/log_results.cc
 * @brief BiergartenDataGenerator::LogResults() implementation.
 */

#include <boost/json/array.hpp>
#include <chrono>
#include <format>

#include "../../includes/json_handling/pretty_print.h"
#include "biergarten_pipeline_orchestrator.h"
#include "services/logging/logger.h"
void BiergartenPipelineOrchestrator::LogResults() const {
  boost::json::array output;

  for (const auto& [location, brewery] : generated_breweries_) {
    output.push_back(boost::json::object{
        {"name_en", brewery.name_en},
        {"description_en", brewery.description_en},
        {"name_local", brewery.name_local},
        {"description_local", brewery.description_local},
        {"location", boost::json::object{
                         {"city", location.city},
                         {"country", location.country},
                         {"state_province", location.state_province},
                         {"iso3166_2", location.iso3166_2},
                         {"latitude", location.latitude},
                         {"longitude", location.longitude},
                     }}});
  }

  std::ostringstream oss;
  PrettyPrint(oss, output);
  logger_->Log({.level = LogLevel::Info,
                .phase = PipelinePhase::Teardown,
                .message = oss.str()});
}
