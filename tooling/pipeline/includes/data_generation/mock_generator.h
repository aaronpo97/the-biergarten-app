#ifndef BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_MOCK_GENERATOR_H_
#define BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_MOCK_GENERATOR_H_

/**
 * @file data_generation/mock_generator.h
 * @brief Deterministic mock implementation of DataGenerator.
 */

#include <array>
#include <string>
#include <string_view>

#include "data_generation/data_generator.h"

/**
 * @brief Mock generator used for deterministic, model-free outputs.
 */
class MockGenerator final : public DataGenerator {
 public:
  /**
   * @brief Generates deterministic brewery data for a location.
   *
   * @param location City and country names.
   * @param region_context Unused for mock generation.
   * @return Generated brewery result.
   */
  BreweryResult GenerateBrewery(const Location& location,
                                const std::string& region_context) override;

  /**
   * @brief Generates deterministic user data for a locale.
   *
   * @param locale Locale hint.
   * @return Generated user result.
   */
  UserResult GenerateUser(const std::string& locale) override;

 private:
  /**
   * @brief Combines two strings into a stable hash value.
   *
   * @param location City and country names.
   * @return Deterministic hash value.
   */
  static size_t DeterministicHash(const Location& location);

  static constexpr std::array<std::string_view, 18> kBreweryAdjectives = {
      "Craft",      "Heritage", "Local",  "Artisan",  "Pioneer",    "Golden",
      "Modern",     "Classic",  "Summit", "Northern", "Riverstone", "Barrel",
      "Hinterland", "Harbor",   "Wild",   "Granite",  "Copper",     "Maple"};

  static constexpr std::array<std::string_view, 18> kBreweryNouns = {
      "Brewing Co.", "Brewery",    "Bier Haus", "Taproom",      "Works",
      "House",       "Fermentery", "Ale Co.",   "Cellars",      "Collective",
      "Project",     "Foundry",    "Malthouse", "Public House", "Co-op",
      "Lab",         "Beer Hall",  "Guild"};

  static constexpr std::array<std::string_view, 18> kBreweryDescriptions = {
      "Handcrafted pale ales and seasonal IPAs with local ingredients.",
      "Traditional lagers and experimental sours in small batches.",
      "Award-winning stouts and wildly hoppy blonde ales.",
      "Craft brewery specializing in Belgian-style triples and dark "
      "porters.",
      "Modern brewery blending tradition with bold experimental flavors.",
      "Neighborhood-focused taproom pouring crisp pilsners and citrusy "
      "pale "
      "ales.",
      "Small-batch brewery known for barrel-aged releases and smoky "
      "lagers.",
      "Independent brewhouse pairing farmhouse ales with rotating food "
      "pop-ups.",
      "Community brewpub making balanced bitters, saisons, and hazy IPAs.",
      "Experimental nanobrewery exploring local yeast and regional "
      "grains.",
      "Family-run brewery producing smooth amber ales and robust porters.",
      "Urban brewery crafting clean lagers and bright, fruit-forward "
      "sours.",
      "Riverfront brewhouse featuring oak-matured ales and seasonal "
      "blends.",
      "Modern taproom focused on sessionable lagers and classic pub "
      "styles.",
      "Brewery rooted in tradition with a lineup of malty reds and crisp "
      "lagers.",
      "Creative brewery offering rotating collaborations and limited "
      "draft-only "
      "pours.",
      "Locally inspired brewery serving approachable ales with bold hop "
      "character.",
      "Destination taproom known for balanced IPAs and cocoa-rich "
      "stouts."};

  static constexpr std::array<std::string_view, 18> kUsernames = {
      "hopseeker",     "malttrail",   "yeastwhisper",  "lagerlane",
      "barrelbound",   "foamfinder",  "taphunter",     "graingeist",
      "brewscout",     "aleatlas",    "caskcompass",   "hopsandmaps",
      "mashpilot",     "pintnomad",   "fermentfriend", "stoutsignal",
      "sessionwander", "kettlekeeper"};

  static constexpr std::array<std::string_view, 18> kBios = {
      "Always chasing balanced IPAs and crisp lagers across local taprooms.",
      "Weekend brewery explorer with a soft spot for dark, roasty stouts.",
      "Documenting tiny brewpubs, fresh pours, and unforgettable beer "
      "gardens.",
      "Fan of farmhouse ales, food pairings, and long tasting flights.",
      "Collecting favorite pilsners one city at a time.",
      "Hops-first drinker who still saves room for classic malt-forward "
      "styles.",
      "Finding hidden tap lists and sharing the best seasonal releases.",
      "Brewery road-tripper focused on local ingredients and clean "
      "fermentation.",
      "Always comparing house lagers and ranking patio pint vibes.",
      "Curious about yeast strains, barrel programs, and cellar experiments.",
      "Believes every neighborhood deserves a great community taproom.",
      "Looking for session beers that taste great from first sip to last.",
      "Belgian ale enthusiast who never skips a new saison.",
      "Hazy IPA critic with deep respect for a perfectly clear pilsner.",
      "Visits breweries for the stories, stays for the flagship pours.",
      "Craft beer fan mapping tasting notes and favorite brew routes.",
      "Always ready to trade recommendations for underrated local breweries.",
      "Keeping a running list of must-try collab releases and tap takeovers."};
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_DATA_GENERATION_MOCK_GENERATOR_H_
