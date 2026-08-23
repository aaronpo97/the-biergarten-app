/**
 * @file data_generation/llama/helpers.cc
 * @brief Token decoding helper for LlamaGenerator modules.
 */

#include <llama.h>

#include <array>
#include <stdexcept>
#include <string>
#include <vector>

#include "data_generation/llama_generator_helpers.h"

void AppendTokenPiece(const llama_vocab* vocab, llama_token token,
                      std::string& output) {
   constexpr size_t initial_buffer_size = 256;

   std::array<char, initial_buffer_size> buffer{};

   // serialize the sampled token into UTF-8 bytes

   auto buffer_too_small = [](int32_t result) -> bool { return result < 0; };

   int32_t bytes = llama_token_to_piece(vocab, token, buffer.data(),
                                        buffer.size(), 0, true);

   if (!buffer_too_small(bytes)) {
      // Append the decoded bytes from the stack buffer.
      output.append(buffer.data(), static_cast<size_t>(bytes));
      return;
   }

   const int32_t required_size = -bytes;
   std::vector<char> dynamic_buffer(static_cast<size_t>(required_size));

   // Retry token decoding against the larger heap buffer.
   bytes = llama_token_to_piece(vocab, token, dynamic_buffer.data(),
                                static_cast<int32_t>(dynamic_buffer.size()), 0,
                                true);

   if (!buffer_too_small(bytes)) {
      output.append(dynamic_buffer.data(), static_cast<size_t>(bytes));
      return;
   }

   throw std::runtime_error(
       "LlamaGenerator: failed to decode sampled token piece");
}
