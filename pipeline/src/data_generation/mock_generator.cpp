#include "data_generation/mock_generator.h"

#include <functional>
#include <spdlog/spdlog.h>

const std::vector<std::string> MockGenerator::kBreweryAdjectives = {
    "Craft",      "Heritage", "Local",  "Artisan",  "Pioneer",    "Golden",
    "Modern",     "Classic",  "Summit", "Northern", "Riverstone", "Barrel",
    "Hinterland", "Harbor",   "Wild",   "Granite",  "Copper",     "Maple"};

const std::vector<std::string> MockGenerator::kBreweryNouns = {
    "Brewing Co.", "Brewery",    "Bier Haus", "Taproom",      "Works",
    "House",       "Fermentery", "Ale Co.",   "Cellars",      "Collective",
    "Project",     "Foundry",    "Malthouse", "Public House", "Co-op",
    "Lab",         "Beer Hall",  "Guild"};

const std::vector<std::string> MockGenerator::kBreweryDescriptions = {
    "Handcrafted pale ales and seasonal IPAs with local ingredients.",
    "Traditional lagers and experimental sours in small batches.",
    "Award-winning stouts and wildly hoppy blonde ales.",
    "Craft brewery specializing in Belgian-style triples and dark porters.",
    "Modern brewery blending tradition with bold experimental flavors.",
    "Neighborhood-focused taproom pouring crisp pilsners and citrusy pale "
    "ales.",
    "Small-batch brewery known for barrel-aged releases and smoky lagers.",
    "Independent brewhouse pairing farmhouse ales with rotating food pop-ups.",
    "Community brewpub making balanced bitters, saisons, and hazy IPAs.",
    "Experimental nanobrewery exploring local yeast and regional grains.",
    "Family-run brewery producing smooth amber ales and robust porters.",
    "Urban brewery crafting clean lagers and bright, fruit-forward sours.",
    "Riverfront brewhouse featuring oak-matured ales and seasonal blends.",
    "Modern taproom focused on sessionable lagers and classic pub styles.",
    "Brewery rooted in tradition with a lineup of malty reds and crisp lagers.",
    "Creative brewery offering rotating collaborations and limited draft-only "
    "pours.",
    "Locally inspired brewery serving approachable ales with bold hop "
    "character.",
    "Destination taproom known for balanced IPAs and cocoa-rich stouts."};

const std::vector<std::string> MockGenerator::kUsernames = {
    "hopseeker",     "malttrail",   "yeastwhisper",  "lagerlane",
    "barrelbound",   "foamfinder",  "taphunter",     "graingeist",
    "brewscout",     "aleatlas",    "caskcompass",   "hopsandmaps",
    "mashpilot",     "pintnomad",   "fermentfriend", "stoutsignal",
    "sessionwander", "kettlekeeper"};

const std::vector<std::string> MockGenerator::kBios = {
    "Always chasing balanced IPAs and crisp lagers across local taprooms.",
    "Weekend brewery explorer with a soft spot for dark, roasty stouts.",
    "Documenting tiny brewpubs, fresh pours, and unforgettable beer gardens.",
    "Fan of farmhouse ales, food pairings, and long tasting flights.",
    "Collecting favorite pilsners one city at a time.",
    "Hops-first drinker who still saves room for classic malt-forward styles.",
    "Finding hidden tap lists and sharing the best seasonal releases.",
    "Brewery road-tripper focused on local ingredients and clean fermentation.",
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

void MockGenerator::load(const std::string & /*modelPath*/) {
  spdlog::info("[MockGenerator] No model needed");
}

std::size_t MockGenerator::deterministicHash(const std::string &a,
                                             const std::string &b) {
  std::size_t seed = std::hash<std::string>{}(a);
  const std::size_t mixed = std::hash<std::string>{}(b);
  seed ^= mixed + 0x9e3779b97f4a7c15ULL + (seed << 6) + (seed >> 2);
  seed = (seed << 13) | (seed >> ((sizeof(std::size_t) * 8) - 13));
  return seed;
}

BreweryResult MockGenerator::generateBrewery(const std::string &cityName,
                                             const std::string &countryName,
                                             const std::string &regionContext) {
  const std::string locationKey =
      countryName.empty() ? cityName : cityName + "," + countryName;
  const std::size_t hash = regionContext.empty()
                               ? std::hash<std::string>{}(locationKey)
                               : deterministicHash(locationKey, regionContext);

  BreweryResult result;
  result.name = kBreweryAdjectives[hash % kBreweryAdjectives.size()] + " " +
                kBreweryNouns[(hash / 7) % kBreweryNouns.size()];
  result.description =
      kBreweryDescriptions[(hash / 13) % kBreweryDescriptions.size()];
  return result;
}

UserResult MockGenerator::generateUser(const std::string &locale) {
  const std::size_t hash = std::hash<std::string>{}(locale);

  UserResult result;
  result.username = kUsernames[hash % kUsernames.size()];
  result.bio = kBios[(hash / 11) % kBios.size()];
  return result;
}
