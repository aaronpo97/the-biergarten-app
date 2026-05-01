#ifndef BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_APPLICATION_OPTIONS_H_
#define BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_APPLICATION_OPTIONS_H_

/**
 * @file data_model/application_options.h
 * @brief Program options for the Biergarten pipeline application.
 */

#include <cstdint>
#include <filesystem>
#include <optional>
#include <string>

/**
 * @brief LLM sampling parameters.
 */
struct SamplingOptions {
  /// @brief LLM sampling temperature (0.0 to 1.0, higher = more random).
  float temperature = 1.0F;

  /// @brief LLM nucleus sampling top-p parameter.
  float top_p = 0.95F;

  /// @brief LLM top-k sampling parameter.
  uint32_t top_k = 64;

  /// @brief Context window size (tokens).
  uint32_t n_ctx = 8192;

  /// @brief Random seed (-1 for random, otherwise non-negative).
  int seed = -1;
};

/**
 * @brief Configuration for the LLM generator component.
 */
struct GeneratorOptions {
  /// @brief Path to the LLM model file (gguf format).
  std::filesystem::path model_path;

  /// @brief Use mocked generator instead of actual LLM inference.
  bool use_mocked = false;

  /// @brief Specific sampling parameters for this generator.
  /// If nullopt, the application should use global defaults.
  std::optional<SamplingOptions> sampling;
};

/**
 * @brief Configuration for the pipeline execution and output.
 */
struct PipelineOptions {
  /// @brief Directory for generated artifacts.
  std::filesystem::path output_path;

  /// @brief Path for application logs.
  std::filesystem::path log_path;
};

/**
 * @brief Root configuration object for the Biergarten pipeline.
 */
struct ApplicationOptions {
  GeneratorOptions generator;
  PipelineOptions pipeline;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_APPLICATION_OPTIONS_H_
