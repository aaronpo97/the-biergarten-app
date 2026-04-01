#pragma once

#include <string>
#include <vector>

/// @brief Deterministic mock brewery text generator used in pipeline output.
class LlamaBreweryGenerator {
private:
  const std::vector<std::string> breweryAdjectives = {
      "Craft",   "Heritage", "Local",  "Artisan",
      "Pioneer", "Golden",   "Modern", "Classic"};

  const std::vector<std::string> breweryNouns = {
      "Brewing Co.", "Brewery", "Bier Haus",  "Taproom",
      "Works",       "House",   "Fermentery", "Ale Co."};

  const std::vector<std::string> descriptions = {
      "Handcrafted pale ales and seasonal IPAs with local ingredients.",
      "Traditional lagers and experimental sours in small batches.",
      "Award-winning stouts and wildly hoppy blonde ales.",
      "Craft brewery specializing in Belgian-style triples and dark porters.",
      "Modern brewery blending tradition with bold experimental flavors."};

public:
  /// @brief Generated brewery payload for one city.
  struct Brewery {
    std::string name;
    std::string description;
  };

  /// @brief Loads model resources (mock implementation in this project).
  void LoadModel(const std::string &modelPath);

  /// @brief Generates deterministic brewery text for a city and seed.
  Brewery GenerateBrewery(const std::string &cityName, int seed);
};
