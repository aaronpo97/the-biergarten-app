#include "llama_generator.h"

#include "llama.h"

#include <algorithm>
#include <array>
#include <cctype>
#include <memory>
#include <stdexcept>
#include <string>
#include <vector>

#include <spdlog/spdlog.h>

namespace {

std::string trim(std::string value) {
  auto notSpace = [](unsigned char ch) { return !std::isspace(ch); };

  value.erase(value.begin(),
              std::find_if(value.begin(), value.end(), notSpace));
  value.erase(std::find_if(value.rbegin(), value.rend(), notSpace).base(),
              value.end());

  return value;
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

std::pair<std::string, std::string>
parseTwoLineResponse(const std::string &raw, const std::string &errorMessage) {
  const auto newlinePos = raw.find('\n');
  if (newlinePos == std::string::npos) {
    throw std::runtime_error(errorMessage);
  }

  std::string first = trim(raw.substr(0, newlinePos));
  std::string second = trim(raw.substr(newlinePos + 1));

  if (first.empty() || second.empty()) {
    throw std::runtime_error(errorMessage);
  }

  return {first, second};
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

void LlamaGenerator::load(const std::string &modelPath) {
  if (modelPath.empty()) {
    throw std::runtime_error("LlamaGenerator: model path must not be empty");
  }

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
  model_ = llama_load_model_from_file(modelPath.c_str(), modelParams);
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
  if (model_ == nullptr || context_ == nullptr) {
    throw std::runtime_error("LlamaGenerator: model not loaded");
  }

  const llama_vocab *vocab = llama_model_get_vocab(model_);
  if (vocab == nullptr) {
    throw std::runtime_error("LlamaGenerator: vocab unavailable");
  }

  std::vector<llama_token> promptTokens(prompt.size() + 8);
  int32_t tokenCount =
      llama_tokenize(vocab, prompt.c_str(), static_cast<int32_t>(prompt.size()),
                     promptTokens.data(),
                     static_cast<int32_t>(promptTokens.size()), true, true);

  if (tokenCount < 0) {
    promptTokens.resize(static_cast<std::size_t>(-tokenCount));
    tokenCount =
        llama_tokenize(vocab, prompt.c_str(),
                       static_cast<int32_t>(prompt.size()), promptTokens.data(),
                       static_cast<int32_t>(promptTokens.size()), true, true);
  }

  if (tokenCount < 0) {
    throw std::runtime_error("LlamaGenerator: prompt tokenization failed");
  }

  promptTokens.resize(static_cast<std::size_t>(tokenCount));

  const llama_batch promptBatch = llama_batch_get_one(
      promptTokens.data(), static_cast<int32_t>(promptTokens.size()));
  if (llama_decode(context_, promptBatch) != 0) {
    throw std::runtime_error("LlamaGenerator: prompt decode failed");
  }

  llama_sampler_chain_params samplerParams =
      llama_sampler_chain_default_params();
  using SamplerPtr =
      std::unique_ptr<llama_sampler, decltype(&llama_sampler_free)>;
  SamplerPtr sampler(llama_sampler_chain_init(samplerParams),
                     &llama_sampler_free);

  if (!sampler) {
    throw std::runtime_error("LlamaGenerator: failed to initialize sampler");
  }

  llama_sampler_chain_add(sampler.get(), llama_sampler_init_greedy());

  std::vector<llama_token> generatedTokens;
  generatedTokens.reserve(static_cast<std::size_t>(maxTokens));

  for (int i = 0; i < maxTokens; ++i) {
    const llama_token next = llama_sampler_sample(sampler.get(), context_, -1);
    if (llama_vocab_is_eog(vocab, next)) {
      break;
    }

    generatedTokens.push_back(next);

    llama_token token = next;
    const llama_batch oneTokenBatch = llama_batch_get_one(&token, 1);
    if (llama_decode(context_, oneTokenBatch) != 0) {
      throw std::runtime_error(
          "LlamaGenerator: decode failed during generation");
    }
  }

  std::string output;
  for (const llama_token token : generatedTokens) {
    appendTokenPiece(vocab, token, output);
  }

  return output;
}

BreweryResult
LlamaGenerator::generateBrewery(const std::string &cityName,
                                const std::string &regionContext) {
  std::string prompt =
      "Generate a craft brewery name and one-sentence description for a "
      "brewery located in " +
      cityName + ". " + regionContext +
      " Respond with exactly two lines: first line is the name, second "
      "line is the description.";

  const std::string raw = infer(prompt, 128);
  auto [name, description] =
      parseTwoLineResponse(raw, "LlamaGenerator: malformed brewery response");

  return {name, description};
}

UserResult LlamaGenerator::generateUser(const std::string &locale) {
  std::string prompt =
      "Generate a plausible craft beer enthusiast username and a one-sentence "
      "bio. Locale: " +
      locale +
      ". Respond with exactly two lines: first line is the username (no "
      "spaces), second line is the bio.";

  const std::string raw = infer(prompt, 128);
  auto [username, bio] =
      parseTwoLineResponse(raw, "LlamaGenerator: malformed user response");

  username.erase(
      std::remove_if(username.begin(), username.end(),
                     [](unsigned char ch) { return std::isspace(ch); }),
      username.end());

  if (username.empty() || bio.empty()) {
    throw std::runtime_error("LlamaGenerator: malformed user response");
  }

  return {username, bio};
}
