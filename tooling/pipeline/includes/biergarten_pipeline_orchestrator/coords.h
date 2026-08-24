#ifndef BIERGARTEN_PIPELINE_INCLUDES_BIERGARTEN_PIPELINE_ORCHESTRATOR_COORDS_H_
#define BIERGARTEN_PIPELINE_INCLUDES_BIERGARTEN_PIPELINE_ORCHESTRATOR_COORDS_H_

/**
 * @file biergarten_pipeline_orchestrator/coords.h
 * @brief Shared coordinate jitter helper used to place generated
 * brewery/user addresses near a city's centre.
 */

#include <cmath>
#include <numbers>
#include <random>

namespace biergarten_pipeline_orchestrator_internal {

struct Coords {
   double longitude;
   double latitude;
};

inline constexpr double kEarthRadiusKm = 6371.0;

inline double DegreesToRadians(double degrees) {
   return degrees * std::numbers::pi / 180.0;
}

inline double RadiansToDegrees(double radians) {
   return radians * 180.0 / std::numbers::pi;
}

/**
 * @brief Samples a point uniformly at random within @p distance_km of
 * @p centre.
 */
inline Coords GetRandomCoordsWithinRange(const Coords& centre,
                                         const int distance_km,
                                         std::mt19937& rng) {
   std::uniform_real_distribution<double> angle_dist(0.0,
                                                     2.0 * std::numbers::pi);
   std::uniform_real_distribution<double> unit_dist(0.0, 1.0);

   const double angle_radians = angle_dist(rng);
   // sqrt() keeps points uniformly distributed over the disc's area.
   const double radius_km = distance_km * std::sqrt(unit_dist(rng));

   const double delta_latitude_degrees =
       RadiansToDegrees(radius_km * std::cos(angle_radians) / kEarthRadiusKm);
   const double delta_longitude_degrees = RadiansToDegrees(
       radius_km * std::sin(angle_radians) /
       (kEarthRadiusKm * std::cos(DegreesToRadians(centre.latitude))));

   return Coords{.longitude = centre.longitude + delta_longitude_degrees,
                 .latitude = centre.latitude + delta_latitude_degrees};
}

}  // namespace biergarten_pipeline_orchestrator_internal

#endif  // BIERGARTEN_PIPELINE_INCLUDES_BIERGARTEN_PIPELINE_ORCHESTRATOR_COORDS_H_
