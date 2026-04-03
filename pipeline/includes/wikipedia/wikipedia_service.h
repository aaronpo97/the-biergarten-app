#ifndef BIERGARTEN_PIPELINE_WIKIPEDIA_WIKIPEDIA_SERVICE_H_
#define BIERGARTEN_PIPELINE_WIKIPEDIA_WIKIPEDIA_SERVICE_H_

#include <memory>
#include <string>
#include <string_view>
#include <unordered_map>

#include "web_client/web_client.h"

/// @brief Provides cached Wikipedia summary lookups for city and country pairs.
class WikipediaService {
  public:
   /// @brief Creates a new Wikipedia service with the provided web client.
   explicit WikipediaService(std::shared_ptr<WebClient> client);

   /// @brief Returns the Wikipedia summary extract for city and country.
   [[nodiscard]] std::string GetSummary(std::string_view city,
                                        std::string_view country);

  private:
   std::string FetchExtract(std::string_view query);
   std::shared_ptr<WebClient> client_;
   std::unordered_map<std::string, std::string> cache_;
};

#endif  // BIERGARTEN_PIPELINE_WIKIPEDIA_WIKIPEDIA_SERVICE_H_
