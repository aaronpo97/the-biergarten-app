#include <algorithm>
#include <array>
#include <cctype>
#include <memory>
#include <sstream>
#include <stdexcept>
#include <string>
#include <vector>

#include "llama.h"
#include <boost/json.hpp>
#include <spdlog/spdlog.h>

#include "llama_generator.h"

namespace {

std::string trim(std::string value) {
  auto notSpace = [](unsigned char ch) { return !std::isspace(ch); };

  value.erase(value.begin(),
              std::find_if(value.begin(), value.end(), notSpace));
  value.erase(std::find_if(value.rbegin(), value.rend(), notSpace).base(),
              value.end());

  return value;
}

std::string CondenseWhitespace(std::string text) {
  std::string out;
  out.reserve(text.size());

  bool inWhitespace = false;
  for (unsigned char ch : text) {
    if (std::isspace(ch)) {
      if (!inWhitespace) {
        out.push_back(' ');
        inWhitespace = true;
      }
      continue;
    }

    inWhitespace = false;
    out.push_back(static_cast<char>(ch));
  }

  return trim(std::move(out));
}

std::string PrepareRegionContext(std::string_view regionContext,
                                 std::size_t maxChars = 700) {
  std::string normalized = CondenseWhitespace(std::string(regionContext));
  if (normalized.size() <= maxChars) {
    return normalized;
  }

  normalized.resize(maxChars);
  const std::size_t lastSpace = normalized.find_last_of(' ');
  if (lastSpace != std::string::npos && lastSpace > maxChars / 2) {
    normalized.resize(lastSpace);
  }

  normalized += "...";
  return normalized;
}

std::string stripCommonPrefix(std::string line) {
  line = trim(std::move(line));

  if (!line.empty() && (line[0] == '-' || line[0] == '*')) {
    line = trim(line.substr(1));
  } else {
    std::size_t i = 0;
    while (i < line.size() &&
           std::isdigit(static_cast<unsigned char>(line[i]))) {
      ++i;
    }
    if (i > 0 && i < line.size() && (line[i] == '.' || line[i] == ')')) {
      line = trim(line.substr(i + 1));
    }
  }

  auto stripLabel = [&line](const std::string &label) {
    if (line.size() >= label.size()) {
      bool matches = true;
      for (std::size_t i = 0; i < label.size(); ++i) {
        if (std::tolower(static_cast<unsigned char>(line[i])) !=
            std::tolower(static_cast<unsigned char>(label[i]))) {
          matches = false;
          break;
        }
      }
      if (matches) {
        line = trim(line.substr(label.size()));
      }
    }
  };

  stripLabel("name:");
  stripLabel("brewery name:");
  stripLabel("description:");
  stripLabel("username:");
  stripLabel("bio:");

  return trim(std::move(line));
}

std::pair<std::string, std::string>
parseTwoLineResponse(const std::string &raw, const std::string &errorMessage) {
  std::string normalized = raw;
  std::replace(normalized.begin(), normalized.end(), '\r', '\n');

  std::vector<std::string> lines;
  std::stringstream stream(normalized);
  std::string line;
  while (std::getline(stream, line)) {
    line = stripCommonPrefix(std::move(line));
    if (!line.empty())
      lines.push_back(std::move(line));
  }

  std::vector<std::string> filtered;
  for (auto &l : lines) {
    std::string low = l;
    std::transform(low.begin(), low.end(), low.begin(), [](unsigned char c) {
      return static_cast<char>(std::tolower(c));
    });
    if (!l.empty() && l.front() == '<' && low.back() == '>')
      continue;
    if (low.rfind("okay,", 0) == 0 || low.rfind("hmm", 0) == 0)
      continue;
    filtered.push_back(std::move(l));
  }

  if (filtered.size() < 2)
    throw std::runtime_error(errorMessage);

  std::string first = trim(filtered.front());
  std::string second;
  for (size_t i = 1; i < filtered.size(); ++i) {
    if (!second.empty())
      second += ' ';
    second += filtered[i];
  }
  second = trim(std::move(second));

  if (first.empty() || second.empty())
    throw std::runtime_error(errorMessage);
  return {first, second};
}

std::string toChatPrompt(const llama_model *model,
                         const std::string &userPrompt) {
  const char *tmpl = llama_model_chat_template(model, nullptr);
  if (tmpl == nullptr) {
    return userPrompt;
  }

  const llama_chat_message message{"user", userPrompt.c_str()};

  std::vector<char> buffer(std::max<std::size_t>(1024, userPrompt.size() * 4));
  int32_t required =
      llama_chat_apply_template(tmpl, &message, 1, true, buffer.data(),
                                static_cast<int32_t>(buffer.size()));

  if (required < 0) {
    throw std::runtime_error("LlamaGenerator: failed to apply chat template");
  }

  if (required >= static_cast<int32_t>(buffer.size())) {
    buffer.resize(static_cast<std::size_t>(required) + 1);
    required = llama_chat_apply_template(tmpl, &message, 1, true, buffer.data(),
                                         static_cast<int32_t>(buffer.size()));
    if (required < 0) {
      throw std::runtime_error("LlamaGenerator: failed to apply chat template");
    }
  }

  return std::string(buffer.data(), static_cast<std::size_t>(required));
}

std::string toChatPrompt(const llama_model *model,
                         const std::string &systemPrompt,
                         const std::string &userPrompt) {
  const char *tmpl = llama_model_chat_template(model, nullptr);
  if (tmpl == nullptr) {
    return systemPrompt + "\n\n" + userPrompt;
  }

  const llama_chat_message messages[2] = {{"system", systemPrompt.c_str()},
                                          {"user", userPrompt.c_str()}};

  std::vector<char> buffer(std::max<std::size_t>(
      1024, (systemPrompt.size() + userPrompt.size()) * 4));
  int32_t required =
      llama_chat_apply_template(tmpl, messages, 2, true, buffer.data(),
                                static_cast<int32_t>(buffer.size()));

  if (required < 0) {
    throw std::runtime_error("LlamaGenerator: failed to apply chat template");
  }

  if (required >= static_cast<int32_t>(buffer.size())) {
    buffer.resize(static_cast<std::size_t>(required) + 1);
    required = llama_chat_apply_template(tmpl, messages, 2, true, buffer.data(),
                                         static_cast<int32_t>(buffer.size()));
    if (required < 0) {
      throw std::runtime_error("LlamaGenerator: failed to apply chat template");
    }
  }

  return std::string(buffer.data(), static_cast<std::size_t>(required));
}

void appendTokenPiece(const llama_vocab *vocab, llama_token token,
                      std::string &output) {
  std::array<char, 256> buffer{};
  int32_t bytes =
      llama_token_to_piece(vocab, token, buffer.data(),
                           static_cast<int32_t>(buffer.size()), 0, true);

  if (bytes < 0) {
    std::vector<char> dynamicBuffer(static_cast<std::size_t>(-bytes));
    bytes = llama_token_to_piece(vocab, token, dynamicBuffer.data(),
                                 static_cast<int32_t>(dynamicBuffer.size()), 0,
                                 true);
    if (bytes < 0) {
      throw std::runtime_error(
          "LlamaGenerator: failed to decode sampled token piece");
    }

    output.append(dynamicBuffer.data(), static_cast<std::size_t>(bytes));
    return;
  }

  output.append(buffer.data(), static_cast<std::size_t>(bytes));
}

bool extractFirstJsonObject(const std::string &text, std::string &jsonOut) {
  std::size_t start = std::string::npos;
  int depth = 0;
  bool inString = false;
  bool escaped = false;

  for (std::size_t i = 0; i < text.size(); ++i) {
    const char ch = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch == '\\') {
        escaped = true;
      } else if (ch == '"') {
        inString = false;
      }
      continue;
    }

    if (ch == '"') {
      inString = true;
      continue;
    }

    if (ch == '{') {
      if (depth == 0) {
        start = i;
      }
      ++depth;
      continue;
    }

    if (ch == '}') {
      if (depth == 0) {
        continue;
      }
      --depth;
      if (depth == 0 && start != std::string::npos) {
        jsonOut = text.substr(start, i - start + 1);
        return true;
      }
    }
  }

  return false;
}

std::string ValidateBreweryJson(const std::string &raw, std::string &nameOut,
                                std::string &descriptionOut) {
  auto validateObject = [&](const boost::json::value &jv,
                            std::string &errorOut) -> bool {
    if (!jv.is_object()) {
      errorOut = "JSON root must be an object";
      return false;
    }

    const auto &obj = jv.get_object();
    if (!obj.contains("name") || !obj.at("name").is_string()) {
      errorOut = "JSON field 'name' is missing or not a string";
      return false;
    }

    if (!obj.contains("description") || !obj.at("description").is_string()) {
      errorOut = "JSON field 'description' is missing or not a string";
      return false;
    }

    nameOut = trim(std::string(obj.at("name").as_string().c_str()));
    descriptionOut =
        trim(std::string(obj.at("description").as_string().c_str()));

    if (nameOut.empty()) {
      errorOut = "JSON field 'name' must not be empty";
      return false;
    }

    if (descriptionOut.empty()) {
      errorOut = "JSON field 'description' must not be empty";
      return false;
    }

    std::string nameLower = nameOut;
    std::string descriptionLower = descriptionOut;
    std::transform(
        nameLower.begin(), nameLower.end(), nameLower.begin(),
        [](unsigned char c) { return static_cast<char>(std::tolower(c)); });
    std::transform(descriptionLower.begin(), descriptionLower.end(),
                   descriptionLower.begin(), [](unsigned char c) {
                     return static_cast<char>(std::tolower(c));
                   });

    if (nameLower == "string" || descriptionLower == "string") {
      errorOut = "JSON appears to be a schema placeholder, not content";
      return false;
    }

    errorOut.clear();
    return true;
  };

  boost::system::error_code ec;
  boost::json::value jv = boost::json::parse(raw, ec);
  std::string validationError;
  if (ec) {
    std::string extracted;
    if (!extractFirstJsonObject(raw, extracted)) {
      return "JSON parse error: " + ec.message();
    }

    ec.clear();
    jv = boost::json::parse(extracted, ec);
    if (ec) {
      return "JSON parse error: " + ec.message();
    }

    if (!validateObject(jv, validationError)) {
      return validationError;
    }

    return {};
  }

  if (!validateObject(jv, validationError)) {
    return validationError;
  }

  return {};
}
} // namespace

LlamaGenerator::~LlamaGenerator() {
  if (context_ != nullptr) {
    llama_free(context_);
    context_ = nullptr;
  }

  if (model_ != nullptr) {
    llama_model_free(model_);
    model_ = nullptr;
  }

  llama_backend_free();
}

void LlamaGenerator::setSamplingOptions(float temperature, float topP,
                                        int seed) {
  if (temperature < 0.0f) {
    throw std::runtime_error(
        "LlamaGenerator: sampling temperature must be >= 0");
  }
  if (!(topP > 0.0f && topP <= 1.0f)) {
    throw std::runtime_error(
        "LlamaGenerator: sampling top-p must be in (0, 1]");
  }
  if (seed < -1) {
    throw std::runtime_error(
        "LlamaGenerator: seed must be >= 0, or -1 for random");
  }

  sampling_temperature_ = temperature;
  sampling_top_p_ = topP;
  sampling_seed_ = (seed < 0) ? static_cast<uint32_t>(LLAMA_DEFAULT_SEED)
                              : static_cast<uint32_t>(seed);
}

void LlamaGenerator::load(const std::string &modelPath) {
  if (modelPath.empty())
    throw std::runtime_error("LlamaGenerator: model path must not be empty");

  if (context_ != nullptr) {
    llama_free(context_);
    context_ = nullptr;
  }
  if (model_ != nullptr) {
    llama_model_free(model_);
    model_ = nullptr;
  }

  llama_backend_init();

  llama_model_params modelParams = llama_model_default_params();
  model_ = llama_model_load_from_file(modelPath.c_str(), modelParams);
  if (model_ == nullptr) {
    throw std::runtime_error(
        "LlamaGenerator: failed to load model from path: " + modelPath);
  }

  llama_context_params contextParams = llama_context_default_params();
  contextParams.n_ctx = 2048;

  context_ = llama_init_from_model(model_, contextParams);
  if (context_ == nullptr) {
    llama_model_free(model_);
    model_ = nullptr;
    throw std::runtime_error("LlamaGenerator: failed to create context");
  }

  spdlog::info("[LlamaGenerator] Loaded model: {}", modelPath);
}

std::string LlamaGenerator::infer(const std::string &prompt, int maxTokens) {
  if (model_ == nullptr || context_ == nullptr)
    throw std::runtime_error("LlamaGenerator: model not loaded");

  const llama_vocab *vocab = llama_model_get_vocab(model_);
  if (vocab == nullptr)
    throw std::runtime_error("LlamaGenerator: vocab unavailable");

  llama_memory_clear(llama_get_memory(context_), true);

  const std::string formattedPrompt = toChatPrompt(model_, prompt);

  std::vector<llama_token> promptTokens(formattedPrompt.size() + 8);
  int32_t tokenCount = llama_tokenize(
      vocab, formattedPrompt.c_str(),
      static_cast<int32_t>(formattedPrompt.size()), promptTokens.data(),
      static_cast<int32_t>(promptTokens.size()), true, true);

  if (tokenCount < 0) {
    promptTokens.resize(static_cast<std::size_t>(-tokenCount));
    tokenCount = llama_tokenize(
        vocab, formattedPrompt.c_str(),
        static_cast<int32_t>(formattedPrompt.size()), promptTokens.data(),
        static_cast<int32_t>(promptTokens.size()), true, true);
  }

  if (tokenCount < 0)
    throw std::runtime_error("LlamaGenerator: prompt tokenization failed");

  const int32_t nCtx = static_cast<int32_t>(llama_n_ctx(context_));
  const int32_t nBatch = static_cast<int32_t>(llama_n_batch(context_));
  if (nCtx <= 1 || nBatch <= 0) {
    throw std::runtime_error("LlamaGenerator: invalid context or batch size");
  }

  const int32_t effectiveMaxTokens = std::max(1, std::min(maxTokens, nCtx - 1));
  int32_t promptBudget = std::min(nBatch, nCtx - effectiveMaxTokens);
  promptBudget = std::max<int32_t>(1, promptBudget);

  promptTokens.resize(static_cast<std::size_t>(tokenCount));
  if (tokenCount > promptBudget) {
    spdlog::warn(
        "LlamaGenerator: prompt too long ({} tokens), truncating to {} tokens "
        "to fit n_batch/n_ctx limits",
        tokenCount, promptBudget);
    promptTokens.resize(static_cast<std::size_t>(promptBudget));
    tokenCount = promptBudget;
  }

  const llama_batch promptBatch = llama_batch_get_one(
      promptTokens.data(), static_cast<int32_t>(promptTokens.size()));
  if (llama_decode(context_, promptBatch) != 0)
    throw std::runtime_error("LlamaGenerator: prompt decode failed");

  llama_sampler_chain_params samplerParams =
      llama_sampler_chain_default_params();
  using SamplerPtr =
      std::unique_ptr<llama_sampler, decltype(&llama_sampler_free)>;
  SamplerPtr sampler(llama_sampler_chain_init(samplerParams),
                     &llama_sampler_free);
  if (!sampler)
    throw std::runtime_error("LlamaGenerator: failed to initialize sampler");

  llama_sampler_chain_add(sampler.get(),
                          llama_sampler_init_temp(sampling_temperature_));
  llama_sampler_chain_add(sampler.get(),
                          llama_sampler_init_top_p(sampling_top_p_, 1));
  llama_sampler_chain_add(sampler.get(),
                          llama_sampler_init_dist(sampling_seed_));

  std::vector<llama_token> generatedTokens;
  generatedTokens.reserve(static_cast<std::size_t>(maxTokens));

  for (int i = 0; i < effectiveMaxTokens; ++i) {
    const llama_token next = llama_sampler_sample(sampler.get(), context_, -1);
    if (llama_vocab_is_eog(vocab, next))
      break;
    generatedTokens.push_back(next);
    llama_token token = next;
    const llama_batch oneTokenBatch = llama_batch_get_one(&token, 1);
    if (llama_decode(context_, oneTokenBatch) != 0)
      throw std::runtime_error(
          "LlamaGenerator: decode failed during generation");
  }

  std::string output;
  for (const llama_token token : generatedTokens)
    appendTokenPiece(vocab, token, output);
  return output;
}

std::string LlamaGenerator::infer(const std::string &systemPrompt,
                                  const std::string &prompt, int maxTokens) {
  if (model_ == nullptr || context_ == nullptr)
    throw std::runtime_error("LlamaGenerator: model not loaded");

  const llama_vocab *vocab = llama_model_get_vocab(model_);
  if (vocab == nullptr)
    throw std::runtime_error("LlamaGenerator: vocab unavailable");

  llama_memory_clear(llama_get_memory(context_), true);

  const std::string formattedPrompt =
      toChatPrompt(model_, systemPrompt, prompt);

  std::vector<llama_token> promptTokens(formattedPrompt.size() + 8);
  int32_t tokenCount = llama_tokenize(
      vocab, formattedPrompt.c_str(),
      static_cast<int32_t>(formattedPrompt.size()), promptTokens.data(),
      static_cast<int32_t>(promptTokens.size()), true, true);

  if (tokenCount < 0) {
    promptTokens.resize(static_cast<std::size_t>(-tokenCount));
    tokenCount = llama_tokenize(
        vocab, formattedPrompt.c_str(),
        static_cast<int32_t>(formattedPrompt.size()), promptTokens.data(),
        static_cast<int32_t>(promptTokens.size()), true, true);
  }

  if (tokenCount < 0)
    throw std::runtime_error("LlamaGenerator: prompt tokenization failed");

  const int32_t nCtx = static_cast<int32_t>(llama_n_ctx(context_));
  const int32_t nBatch = static_cast<int32_t>(llama_n_batch(context_));
  if (nCtx <= 1 || nBatch <= 0) {
    throw std::runtime_error("LlamaGenerator: invalid context or batch size");
  }

  const int32_t effectiveMaxTokens = std::max(1, std::min(maxTokens, nCtx - 1));
  int32_t promptBudget = std::min(nBatch, nCtx - effectiveMaxTokens);
  promptBudget = std::max<int32_t>(1, promptBudget);

  promptTokens.resize(static_cast<std::size_t>(tokenCount));
  if (tokenCount > promptBudget) {
    spdlog::warn(
        "LlamaGenerator: prompt too long ({} tokens), truncating to {} tokens "
        "to fit n_batch/n_ctx limits",
        tokenCount, promptBudget);
    promptTokens.resize(static_cast<std::size_t>(promptBudget));
    tokenCount = promptBudget;
  }

  const llama_batch promptBatch = llama_batch_get_one(
      promptTokens.data(), static_cast<int32_t>(promptTokens.size()));
  if (llama_decode(context_, promptBatch) != 0)
    throw std::runtime_error("LlamaGenerator: prompt decode failed");

  llama_sampler_chain_params samplerParams =
      llama_sampler_chain_default_params();
  using SamplerPtr =
      std::unique_ptr<llama_sampler, decltype(&llama_sampler_free)>;
  SamplerPtr sampler(llama_sampler_chain_init(samplerParams),
                     &llama_sampler_free);
  if (!sampler)
    throw std::runtime_error("LlamaGenerator: failed to initialize sampler");

  llama_sampler_chain_add(sampler.get(),
                          llama_sampler_init_temp(sampling_temperature_));
  llama_sampler_chain_add(sampler.get(),
                          llama_sampler_init_top_p(sampling_top_p_, 1));
  llama_sampler_chain_add(sampler.get(),
                          llama_sampler_init_dist(sampling_seed_));

  std::vector<llama_token> generatedTokens;
  generatedTokens.reserve(static_cast<std::size_t>(maxTokens));

  for (int i = 0; i < effectiveMaxTokens; ++i) {
    const llama_token next = llama_sampler_sample(sampler.get(), context_, -1);
    if (llama_vocab_is_eog(vocab, next))
      break;
    generatedTokens.push_back(next);
    llama_token token = next;
    const llama_batch oneTokenBatch = llama_batch_get_one(&token, 1);
    if (llama_decode(context_, oneTokenBatch) != 0)
      throw std::runtime_error(
          "LlamaGenerator: decode failed during generation");
  }

  std::string output;
  for (const llama_token token : generatedTokens)
    appendTokenPiece(vocab, token, output);
  return output;
}

BreweryResult
LlamaGenerator::generateBrewery(const std::string &cityName,
                                const std::string &countryName,
                                const std::string &regionContext) {
  const std::string safeRegionContext = PrepareRegionContext(regionContext);

  const std::string systemPrompt =
      "You are a copywriter for a craft beer travel guide. "
      "Your writing is vivid, specific to place, and avoids generic beer "
      "cliches. "
      "You must output ONLY valid JSON. "
      "The JSON schema must be exactly: {\"name\": \"string\", "
      "\"description\": \"string\"}. "
      "Do not include markdown formatting or backticks.";

  std::string prompt =
      "Write a brewery name and place-specific description for a craft "
      "brewery in " +
      cityName +
      (countryName.empty() ? std::string("")
                           : std::string(", ") + countryName) +
      (safeRegionContext.empty()
           ? std::string(".")
           : std::string(". Regional context: ") + safeRegionContext);

  const int maxAttempts = 3;
  std::string raw;
  std::string lastError;
  for (int attempt = 0; attempt < maxAttempts; ++attempt) {
    raw = infer(systemPrompt, prompt, 384);
    spdlog::debug("LlamaGenerator: raw output (attempt {}): {}", attempt + 1,
                  raw);

    std::string name;
    std::string description;
    const std::string validationError =
        ValidateBreweryJson(raw, name, description);
    if (validationError.empty()) {
      return {std::move(name), std::move(description)};
    }

    lastError = validationError;
    spdlog::warn("LlamaGenerator: malformed brewery JSON (attempt {}): {}",
                 attempt + 1, validationError);

    prompt = "Your previous response was invalid. Error: " + validationError +
             "\nReturn ONLY valid JSON with this exact schema: "
             "{\"name\": \"string\", \"description\": \"string\"}."
             "\nDo not include markdown, comments, or extra keys."
             "\n\nLocation: " +
             cityName +
             (countryName.empty() ? std::string("")
                                  : std::string(", ") + countryName) +
             (safeRegionContext.empty()
                  ? std::string("")
                  : std::string("\nRegional context: ") + safeRegionContext);
  }

  spdlog::error("LlamaGenerator: malformed brewery response after {} attempts: "
                "{}",
                maxAttempts, lastError.empty() ? raw : lastError);
  throw std::runtime_error("LlamaGenerator: malformed brewery response");
}

UserResult LlamaGenerator::generateUser(const std::string &locale) {
  const std::string systemPrompt =
      "You generate plausible social media profiles for craft beer "
      "enthusiasts. "
      "Respond with exactly two lines: "
      "the first line is a username (lowercase, no spaces, 8-20 characters), "
      "the second line is a one-sentence bio (20-40 words). "
      "The profile should feel consistent with the locale. "
      "No preamble, no labels.";

  std::string prompt =
      "Generate a craft beer enthusiast profile. Locale: " + locale;

  const int maxAttempts = 3;
  std::string raw;
  for (int attempt = 0; attempt < maxAttempts; ++attempt) {
    raw = infer(systemPrompt, prompt, 128);
    spdlog::debug("LlamaGenerator (user): raw output (attempt {}): {}",
                  attempt + 1, raw);

    try {
      auto [username, bio] =
          parseTwoLineResponse(raw, "LlamaGenerator: malformed user response");

      username.erase(
          std::remove_if(username.begin(), username.end(),
                         [](unsigned char ch) { return std::isspace(ch); }),
          username.end());

      if (username.empty() || bio.empty()) {
        throw std::runtime_error("LlamaGenerator: malformed user response");
      }

      if (bio.size() > 200)
        bio = bio.substr(0, 200);

      return {username, bio};
    } catch (const std::exception &e) {
      spdlog::warn("LlamaGenerator: malformed user response (attempt {}): {}",
                   attempt + 1, e.what());
    }
  }

  spdlog::error("LlamaGenerator: malformed user response after {} attempts: {}",
                maxAttempts, raw);
  throw std::runtime_error("LlamaGenerator: malformed user response");
}
