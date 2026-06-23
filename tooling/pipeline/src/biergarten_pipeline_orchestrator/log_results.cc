/**
 * @file biergarten_pipeline_orchestrator/log_results.cc
 * @brief BiergartenPipelineOrchestrator::LogResults() implementation.
 */

#include <boost/json/array.hpp>
#include <chrono>
#include <format>

#include "../../includes/json_handling/pretty_print.h"
#include "biergarten_pipeline_orchestrator.h"
#include "services/logging/logger.h"

void BiergartenPipelineOrchestrator::LogResults() const {
  boost::json::array brewery_output;

  for (const auto& [location, brewery] : generated_breweries_) {
    brewery_output.push_back(boost::json::object{
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

  std::ostringstream brewery_oss;
  PrettyPrint(brewery_oss, brewery_output);
  logger_->Log({.level = LogLevel::Info,
                .phase = PipelinePhase::Teardown,
                .message = brewery_oss.str()});

  boost::json::array user_output;

  for (const auto& generated_user : generated_users_) {
    user_output.push_back(boost::json::object{
        {"first_name", generated_user.user.first_name},
        {"last_name", generated_user.user.last_name},
        {"gender", generated_user.user.gender},
        {"username", generated_user.user.username},
        {"bio", generated_user.user.bio},
        {"activity_weight", generated_user.user.activity_weight},
        {"email", generated_user.email},
        {"date_of_birth", generated_user.date_of_birth},
    });
  }

  std::ostringstream user_oss;
  PrettyPrint(user_oss, user_output);
  logger_->Log({.level = LogLevel::Info,
                .phase = PipelinePhase::Teardown,
                .message = user_oss.str()});
}
