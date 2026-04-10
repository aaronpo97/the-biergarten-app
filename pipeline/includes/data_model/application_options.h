#ifndef BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_APPLICATION_OPTIONS_H_
#define BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_APPLICATION_OPTIONS_H_

/**
 * @file data_model/application_options.h
 * @brief Program options for the Biergarten pipeline application.
 */

#include <cstdint>
#include <string>

/**
 * @brief Program options for the Biergarten pipeline application.
 */
struct ApplicationOptions {
   /// @brief Path to the LLM model file (gguf format); mutually exclusive with
   /// use_mocked.
   std::string model_path;

   /// @brief Use mocked generator instead of LLM; mutually exclusive with
   /// model_path.
   bool use_mocked = false;

   /// @brief LLM sampling temperature (0.0 to 1.0, higher = more random).
   float temperature = 1.0F;

   /// @brief LLM nucleus sampling top-p parameter (0.0 to 1.0, higher = more
   /// random).
   float top_p = 0.95F;

   /// @brief LLM top-k sampling parameter.
   uint32_t top_k = 64;

   /// @brief Context window size (tokens) for LLM inference. Higher values
   /// support longer prompts but use more memory.
   uint32_t n_ctx = 8192;

   /// @brief Random seed for sampling (-1 for random, otherwise non-negative).
   int seed = -1;
};

#endif  // BIERGARTEN_PIPELINE_INCLUDES_DATA_MODEL_APPLICATION_OPTIONS_H_
