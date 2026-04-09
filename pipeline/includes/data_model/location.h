#ifndef BIERGARTEN_PIPELINE_MODELS_LOCATION_H_
#define BIERGARTEN_PIPELINE_MODELS_LOCATION_H_

#include <string>

struct Location {
   std::string city;
   std::string state_province;
   std::string iso3166_2;
   std::string country;
   std::string iso3166_1;
   double latitude;
   double longitude;
};

#endif  // BIERGARTEN_PIPELINE_MODELS_LOCATION_H_
