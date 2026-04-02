#include "llama_generator.h"

#include "llama.h"

#include <algorithm>
#include <array>
#include <cctype>
#include <memory>
#include <sstream>
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

std::string stripCommonPrefix(std::string line) {
  line = trim(std::move(line));

  // Strip simple list markers like "- ", "* ", "1. ", "2) ".
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

std::string toChatPrompt(const llama_model *model,
                         const std::string &userPrompt) {
  const char *tmpl = llama_model_chat_template(model, nullptr);
  if (tmpl == nullptr) {
    return userPrompt;
  }

  const llama_chat_message message{
      "user",
      userPrompt.c_str(),
  };

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
    // Fall back to concatenating but keep system and user parts distinct.
    return systemPrompt + "\n\n" + userPrompt;
  }

  const llama_chat_message messages[2] = {
      {"system", systemPrompt.c_str()},
      {"user", userPrompt.c_str()},
  };

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

std::pair<std::string, std::string>
parseTwoLineResponse(const std::string &raw, const std::string &errorMessage) {
  std::string normalized = raw;
  std::replace(normalized.begin(), normalized.end(), '\r', '\n');

  std::vector<std::string> lines;
  std::stringstream stream(normalized);
  std::string line;
  while (std::getline(stream, line)) {
    line = stripCommonPrefix(std::move(line));
    if (!line.empty()) {
      lines.push_back(std::move(line));
    }
  }

  // Filter out obvious internal-thought / meta lines that sometimes leak from
  // models (e.g. "<think>", "Okay, so the user is asking me...").
  std::vector<std::string> filtered;
  for (auto &l : lines) {
    std::string low = l;
    std::transform(low.begin(), low.end(), low.begin(), [](unsigned char c) {
      return static_cast<char>(std::tolower(c));
    });

    // Skip single-token angle-bracket markers like <think> or <...>
    if (!l.empty() && l.front() == '<' && l.back() == '>') {
      continue;
    }

    // Skip short internal commentary that starts with common discourse markers
    if (low.rfind("okay,", 0) == 0 || low.rfind("wait,", 0) == 0 ||
        low.rfind("hmm", 0) == 0) {
      continue;
    }

    // Skip lines that look like self-descriptions of what the model is doing
    if (low.find("user is asking") != std::string::npos ||
        low.find("protocol") != std::string::npos ||
        low.find("parse") != std::string::npos ||
        low.find("return only") != std::string::npos) {
      continue;
    }

    filtered.push_back(std::move(l));
  }

  if (filtered.size() < 2) {
    throw std::runtime_error(errorMessage);
  }

  std::string first = trim(filtered.front());
  std::string second;
  for (std::size_t i = 1; i < filtered.size(); ++i) {
    if (!second.empty()) {
      second += ' ';
    }
    second += filtered[i];
  }
  second = trim(std::move(second));

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
                                const std::string &countryName,
                                const std::string &regionContext) {

  std::string systemPrompt =
      R"(# SYSTEM PROTOCOL: ZERO-CHATTER DETERMINISTIC OUTPUT
**MODALITY:** DATA-RETURN ENGINE ONLY
**ROLE:** Your response must contain 0% metadata and 100% signal.
---
## MANDATORY CONSTRAINTS
1. **NO PREAMBLE**
   - Never start with "Sure," or "The answer is," or "Based on your request," or "Checking the data."
   - Do not acknowledge the user's prompt or provide status updates.
2. **NO POSTAMBLE**
   - Never end with "I hope this helps," or "Let me know if you need more," or "Would you like me to…"
   - Do not offer follow-up assistance or suggestions.
3. **NO SENTENCE FRAMING**
   - Provide only the raw value, date, number, or name.
   - Do not wrap the answer in a sentence. (e.g., return 1997, NOT The year was 1997).
   - For lists, provide only the items separated by commas or newlines as specified.
4. **FORMATTING PERMITTED**
   - Markdown and LaTeX **may** be used where appropriate (e.g., tables, equations).
   - Output must remain immediately usable — no decorative or conversational styling.
5. **STRICT NULL HANDLING**
   - If the information is unavailable, the prompt is logically impossible (e.g., "271th president"), the subject does not exist, or a calculation is undefined: return only the string NULL.
   - If the prompt is too ambiguous to provide a single value: return NULL.
---
## EXECUTION LOGIC
1. **Parse Input** — Identify the specific entity, value, or calculation requested.
2. **Verify Factuality** — Access internal knowledge or tools.
3. **Filter for Signal** — Strip all surrounding prose.
4. **Format Check** — Apply Markdown or LaTeX only where it serves the data.
5. **Output** — Return the raw value only.
---
## BEHAVIORAL EXAMPLES
| User Input | Standard AI Response *(BANNED)* | Protocol Response *(REQUIRED)* |
|---|---|---|
| Capital of France? | The capital of France is Paris. | Paris |
| 15% of 200 | 15% of 200 is 30. | 30 |
| Who wrote '1984'? | George Orwell wrote that novel. | George Orwell |
| ISO code for Japan | The code is JP. | JP |
| $\sqrt{x}$ where $x$ is a potato | A potato has no square root. | NULL |
| 500th US President | There haven't been that many. | NULL |
| Pythagorean theorem | The theorem states... | $a^2 + b^2 = c^2$ |
---
## FINAL INSTRUCTION
Total silence is preferred over conversational error. Any deviation from the raw-value-only format is a protocol failure. Proceed with next input.)";

  std::string prompt =
      "Generate a craft brewery name and 1000 character description for a "
      "brewery located in " +
      cityName +
      (countryName.empty() ? std::string("")
                           : std::string(", ") + countryName) +
      ". " + regionContext +
      " Respond with exactly two lines: first line is the name, second line is "
      "the description. Do not include bullets, numbering, or any extra text.";

  const std::string raw = infer(systemPrompt, prompt, 512);
  auto [name, description] =
      parseTwoLineResponse(raw, "LlamaGenerator: malformed brewery response");

  return {name, description};
}

std::string LlamaGenerator::infer(const std::string &systemPrompt,
                                  const std::string &prompt, int maxTokens) {
  if (model_ == nullptr || context_ == nullptr) {
    throw std::runtime_error("LlamaGenerator: model not loaded");
  }

  const llama_vocab *vocab = llama_model_get_vocab(model_);
  if (vocab == nullptr) {
    throw std::runtime_error("LlamaGenerator: vocab unavailable");
  }

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

UserResult LlamaGenerator::generateUser(const std::string &locale) {
  std::string prompt =
      "Generate a plausible craft beer enthusiast username and a one-sentence "
      "bio. Locale: " +
      locale +
      ". Respond with exactly two lines: first line is the username (no "
      "spaces), second line is the bio. Do not include bullets, numbering, "
      "or any extra text.";

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
