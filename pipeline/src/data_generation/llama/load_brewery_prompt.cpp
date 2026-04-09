/**
 * @file data_generation/llama/load_brewery_prompt.cpp
 * @brief Resolves brewery system prompt content from cache or filesystem
 * search paths and provides a robust inline fallback prompt when absent.
 */

#include <spdlog/spdlog.h>

#include <filesystem>
#include <fstream>

#include "data_generation/llama_generator.h"

namespace fs = std::filesystem;

/**
 * @brief Loads brewery system prompt from disk or cache.
 *
 * @param prompt_file_path Preferred prompt file location.
 * @return Prompt text loaded from disk or fallback content.
 */
std::string LlamaGenerator::LoadBrewerySystemPrompt(
    const std::string& prompt_file_path) {
   // Return cached version if already loaded
   if (!brewery_system_prompt_.empty()) {
      return brewery_system_prompt_;
   }

   // Try multiple path locations
   std::vector<std::string> paths_to_try = {
       prompt_file_path,             // As provided
       "../" + prompt_file_path,     // One level up
       "../../" + prompt_file_path,  // Two levels up
   };

   for (const auto& path : paths_to_try) {
      std::ifstream prompt_file(path);
      if (prompt_file.is_open()) {
         std::string prompt((std::istreambuf_iterator<char>(prompt_file)),
                            std::istreambuf_iterator<char>());
         prompt_file.close();

         if (!prompt.empty()) {
            spdlog::info(
                "LlamaGenerator: Loaded brewery system prompt from '{}' ({} "
                "chars)",
                path, prompt.length());
            brewery_system_prompt_ = prompt;
            return brewery_system_prompt_;
         }
      }
   }

   spdlog::warn(
       "LlamaGenerator: Could not open brewery system prompt file at any of "
       "the "
       "expected locations. Using fallback inline prompt.");
   return GetFallbackBreweryPrompt();
}

/**
 * @brief Provides an inline fallback brewery system prompt.
 *
 * @return Default fallback prompt text.
 */
std::string LlamaGenerator::GetFallbackBreweryPrompt() {
   return "You are an experienced brewmaster and owner of a local craft "
          "brewery. "
          "Create a distinctive, authentic name and detailed description that "
          "genuinely reflects your specific location, brewing philosophy, "
          "local "
          "culture, and community connection. The brewery must feel real and "
          "grounded—not generic or interchangeable.\n\n"
          "AVOID REPETITIVE PHRASES - Never use:\n"
          "Love letter to, tribute to, rolling hills, picturesque, every sip "
          "tells a story, Come for X stay for Y, rich history, passion, woven "
          "into, ancient roots, timeless, where tradition meets innovation\n\n"
          "OPENING APPROACHES - Choose ONE:\n"
          "1. Start with specific beer style and its regional origins\n"
          "2. Begin with specific brewing challenge (water, altitude, "
          "climate)\n"
          "3. Open with founding story or personal motivation\n"
          "4. Lead with specific local ingredient or resource\n"
          "5. Start with unexpected angle or contradiction\n"
          "6. Open with local event, tradition, or cultural moment\n"
          "7. Begin with tangible architectural or geographic detail\n\n"
          "BE SPECIFIC - Include:\n"
          "- At least ONE concrete proper noun (landmark, river, "
          "neighborhood)\n"
          "- Specific beer styles relevant to the REGION'S culture\n"
          "- Concrete brewing challenges or advantages\n"
          "- Sensory details SPECIFIC to place—not generic adjectives\n\n"
          "LENGTH: 150-250 words. TONE: Can be soulful, irreverent, "
          "matter-of-fact, unpretentious, or minimalist.\n\n"
          "Output ONLY a raw JSON object with keys name and description. "
          "No markdown, backticks, preamble, or trailing text.";
}
