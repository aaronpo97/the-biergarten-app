#ifndef BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_MODELS_H_
#define BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_MODELS_H_

/**
 * @file data_model/models.h
 * @brief Core data models: locations, application configuration, and generation
 * inputs.
 */

#include <boost/program_options.hpp>
#include <cstdint>
#include <filesystem>
#include <functional>
#include <memory>
#include <optional>
#include <string>
#include <string_view>
#include <vector>

class ILogger;

namespace prog_opts = boost::program_options;

// ============================================================================
// City Models
// ============================================================================

/**
 * @brief Curated postal-code metadata for a city, mirroring the
 * `postal_code` object in the locations dataset.
 */
struct PostalCodeSpec {
  /**
   * @brief Permissive country-wide postal-code format regex, used as the
   * validation fallback for a selected example.
   */
  std::string country_format_regex{};

  /**
   * @brief City-specific postal-code regexes (more precise than the country
   * format).
   */
  std::vector<std::string> city_regexes{};

  /**
   * @brief Concrete example postal codes for this city. The postal code
   * service selects from these rather than synthesizing codes.
   */
  std::vector<std::string> examples{};
};

/**
 * @brief Canonical city record for city-level generation.
 */
struct City {
  std::string city{};
  std::string state_province{};

  /**
   * @brief ISO 3166-2 subdivision code.
   */
  std::string iso3166_2{};

  std::string country{};

  /**
   * @brief ISO 3166-1 country code.
   */
  std::string iso3166_1{};

  /**
   * @brief Local language codes in priority order.
   */
  std::vector<std::string> local_languages{};

  /**
   * @brief Postal-code metadata (format regex, city regexes, and concrete
   * examples) sourced directly from the curated locations dataset.
   */
  PostalCodeSpec postal_code{};
};

// ============================================================================
// Name / Persona Models
// ============================================================================

/**
 * @brief A sampled first/last name pair, with the source forename's gender.
 *
 * Produced by the SampleName() helper in generate_users.cc.
 */
struct Name {
  std::string first_name{};
  std::string last_name{};

  /**
   * @brief Gender associated with the sampled forename (e.g. "M", "F"), as
   * reported by the source dataset.
   */
  std::string gender{};
};

/**
 * @brief A single forename entry from the names-by-country fixture data.
 */
struct ForenameEntry {
  /**
   * @brief Romanized forename.
   */
  std::string name{};

  /**
   * @brief Gender associated with this forename, as reported by the source
   * dataset (e.g. "M", "F").
   */
  std::string gender{};

  bool operator==(const ForenameEntry& other) const {
    return name == other.name && gender == other.gender;
  }
};

namespace std {
template <>
struct hash<ForenameEntry> {
  size_t operator()(const ForenameEntry& entry) const noexcept {
    const size_t name_hash = std::hash<std::string>{}(entry.name);
    const size_t gender_hash = std::hash<std::string>{}(entry.gender);
    return name_hash ^ (gender_hash << 1);
  }
};
}  // namespace std

/**
 * @brief A persona archetype used to ground LLM-generated user bios.
 */
struct UserPersona {
  /**
   * @brief Persona display name (e.g. "Hophead Explorer").
   */
  std::string name{};

  /**
   * @brief Short description of the persona's interests and voice.
   */
  std::string description{};

  /**
   * @brief Beer styles this persona gravitates toward.
   */
  std::vector<std::string> style_affinities{};
};

// ============================================================================
// Configuration Models
// ============================================================================

/**
 * @brief LLM sampling parameters.
 */
struct SamplingOptions {
  /**
   * @brief LLM sampling temperature (higher = more random).
   */
  float temperature = 1.0F;

  /**
   * @brief LLM nucleus sampling top-p parameter.
   */
  float top_p = 0.95F;

  /**
   * @brief LLM top-k sampling parameter.
   */
  uint32_t top_k = 64;

  /**
   * @brief Context window size (tokens).
   */
  uint32_t n_ctx = 8192;

  /**
   * @brief Random seed (-1 for random, otherwise non-negative).
   */
  int seed = -1;

  /**
   * @brief Number of layers to offload to GPU.
   */
  int n_gpu_layers = 0;
};

/**
 * @brief Configuration for the LLM generator component.
 */
struct GeneratorOptions {
  /**
   * @brief Path to the LLM model file (gguf format).
   */
  std::filesystem::path model_path;

  /**
   * @brief Use mocked generator instead of actual LLM inference.
   */
  bool use_mocked = false;

  /**
   * @brief Specific sampling parameters for this generator.
   * If nullopt, the application should use global defaults.
   */
  std::optional<SamplingOptions> sampling;
};

/**
 * @brief Configuration for the pipeline execution and output.
 */
struct PipelineOptions {
  /**
   * @brief Directory for generated artifacts.
   */
  std::filesystem::path output_path;

  /**
   * @brief Directory that contains named prompt files (e.g.
   * BREWERY_GENERATION.md).
   */
  std::filesystem::path prompt_dir;

  std::filesystem::path log_path;

  /**
   * @brief Number of locations to sample from the dataset
   * More locations -> more users/more breweries
   */
  uint32_t location_count;
};

/**
 * @brief Root configuration object for the Biergarten pipeline.
 */
struct ApplicationOptions {
  GeneratorOptions generator;
  PipelineOptions pipeline;
};

// ============================================================================
// Function Declarations
// ============================================================================

std::optional<ApplicationOptions> ParseArguments(
    const int argc, char** argv, std::shared_ptr<ILogger> logger = nullptr);

#endif  // BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_MODELS_H_
