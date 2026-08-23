/**
 * @file biergarten_pipeline_orchestrator/generate_breweries.cc
 * @brief BiergartenPipelineOrchestrator::GenerateBreweries() implementation.
 */

#include <chrono>
#include <cmath>
#include <format>
#include <numbers>
#include <optional>
#include <random>

#include "biergarten_pipeline_orchestrator.h"
#include "services/logging/logger.h"

struct Coords {
   double longitude;
   double latitude;
};

// @todo find a better home for this
namespace {
constexpr double kEarthRadiusKm = 6371.0;

double DegreesToRadians(double degrees) {
   return degrees * std::numbers::pi / 180.0;
}

double RadiansToDegrees(double radians) {
   return radians * 180.0 / std::numbers::pi;
}
}  // namespace

static Coords GetRandomCoordsWithinRange(const Coords& centre,
                                         const int distance_km,
                                         std::mt19937& rng) {
   std::uniform_real_distribution<double> angle_dist(0.0,
                                                     2.0 * std::numbers::pi);
   std::uniform_real_distribution<double> unit_dist(0.0, 1.0);

   const double angle_radians = angle_dist(rng);
   // sqrt() keeps points uniformly distributed over the disc's area rather
   // than clustering near the centre.
   const double radius_km = distance_km * std::sqrt(unit_dist(rng));

   const double delta_latitude_degrees =
       RadiansToDegrees(radius_km * std::cos(angle_radians) / kEarthRadiusKm);
   const double delta_longitude_degrees = RadiansToDegrees(
       radius_km * std::sin(angle_radians) /
       (kEarthRadiusKm * std::cos(DegreesToRadians(centre.latitude))));

   return Coords{.longitude = centre.longitude + delta_longitude_degrees,
                 .latitude = centre.latitude + delta_latitude_degrees};
}

void BiergartenPipelineOrchestrator::GenerateBreweries(
    std::span<const EnrichedCity> cities) {
   logger_->Log({.level = LogLevel::Info,
                 .phase = PipelinePhase::BreweryAndBeerGeneration,
                 .message = "=== SAMPLE BREWERY GENERATION ==="});

   generated_breweries_.clear();
   size_t skipped_count = 0;
   size_t export_failed_count = 0;
   std::mt19937 rng(std::random_device{}());

   const auto generate_record =
       [this, &skipped_count, &rng](
           const EnrichedCity& enriched_city) -> std::optional<BreweryRecord> {
      try {
         const BreweryResult brewery =
             generator_->GenerateBrewery(enriched_city);
         const std::string postal_code =
             postal_code_service_->GeneratePostalCode(enriched_city.location);

         constexpr int kMaxDistanceFromCentreKm = 5;
         const Coords city_centre{.longitude = enriched_city.location.longitude,
                                  .latitude = enriched_city.location.latitude};
         const Coords brewery_coords = GetRandomCoordsWithinRange(
             city_centre, kMaxDistanceFromCentreKm, rng);

         return BreweryRecord{
             .address = BreweryAddress{.city = enriched_city.location,
                                       .postal_code = postal_code,
                                       .longitude = brewery_coords.longitude,
                                       .latitude = brewery_coords.latitude},
             .brewery = brewery};
      } catch (const std::exception& e) {
         ++skipped_count;

         logger_->Log({.level = LogLevel::Warn,
                       .phase = PipelinePhase::BreweryAndBeerGeneration,
                       .message = std::format(
                           "[Pipeline] Skipping city '{}' ({}): brewery "
                           "generation failed: {}",
                           enriched_city.location.city,
                           enriched_city.location.country, e.what())});
         return std::nullopt;
      }
   };

   const auto export_record =
       [this, &export_failed_count](const BreweryRecord& record) {
          try {
             exporter_->ProcessRecord(record);
          } catch (const std::exception& export_exception) {
             ++export_failed_count;
             logger_->Log(
                 {.level = LogLevel::Warn,
                  .phase = PipelinePhase::BreweryAndBeerGeneration,
                  .message = std::format(
                      "[Pipeline] Generated brewery for '{}' ({}) "
                      "but SQLite export failed: {}",
                      record.address.city.city, record.address.city.country,
                      export_exception.what())});
          }
       };

   for (const EnrichedCity& enriched_city : cities) {
      const std::optional<BreweryRecord> record =
          generate_record(enriched_city);
      if (!record.has_value()) {
         continue;
      }

      generated_breweries_.push_back(*record);
      export_record(*record);
   }

   if (skipped_count > 0) {
      logger_->Log(
          {.level = LogLevel::Warn,
           .phase = PipelinePhase::BreweryAndBeerGeneration,
           .message = std::format(
               "[Pipeline] Skipped {} city/cities due to generation errors",
               skipped_count)});
   }

   if (export_failed_count > 0) {
      logger_->Log(
          {.level = LogLevel::Warn,
           .phase = PipelinePhase::Teardown,
           .message = std::format("[Pipeline] Failed to export {} generated "
                                  "brewery/breweries to SQLite",
                                  export_failed_count)});
   }
}