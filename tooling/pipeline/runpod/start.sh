#!/bin/bash
set -e

MODEL_PATH="${BIERGARTEN_MODEL_PATH:-/workspace/models/google_gemma-4-E4B-it-Q6_K.gguf}"
OUTPUT_DIR="${BIERGARTEN_OUTPUT_DIR:-/workspace/output}"
LOG_PATH="${BIERGARTEN_LOG_PATH:-/workspace/logs/pipeline.log}"
EXECUTABLE="/app/build/biergarten-pipeline"
PROMPT_DIR="/app/prompts"

echo "--- Starting Biergarten Pipeline Environment Check ---"

# Ensure directories exist
mkdir -p "$OUTPUT_DIR"
mkdir -p "$(dirname "$LOG_PATH")"
mkdir -p "$(dirname "$MODEL_PATH")"

# Download model if missing
if [ ! -f "$MODEL_PATH" ]; then
    echo "Model not found. Downloading (this may take a while)..."

    curl -L -C - \
      -o "$MODEL_PATH" \
      "https://huggingface.co/bartowski/google_gemma-4-E4B-it-GGUF/resolve/main/google_gemma-4-E4B-it-Q6_K.gguf?download=true"

    echo "Download complete."
fi

# Verify model exists
if [ ! -f "$MODEL_PATH" ]; then
    echo "ERROR: Model still not found after download attempt."
    exit 1
fi

# Default GPU layers
GL_LAYERS="${BIERGARTEN_GL_LAYERS:-40}"

# Build args
ARGS=(
    "--model"      "$MODEL_PATH"
    "--prompt-dir" "$PROMPT_DIR"
    "--output"     "$OUTPUT_DIR"
    "--log-path"   "$LOG_PATH"
    "--n-gpu-layers" "$GL_LAYERS"
)

# Optional params
[[ -n "$BIERGARTEN_TEMPERATURE" ]] && ARGS+=("--temperature"  "$BIERGARTEN_TEMPERATURE")
[[ -n "$BIERGARTEN_TOP_P" ]]       && ARGS+=("--top-p"        "$BIERGARTEN_TOP_P")
[[ -n "$BIERGARTEN_TOP_K" ]]       && ARGS+=("--top-k"        "$BIERGARTEN_TOP_K")
[[ -n "$BIERGARTEN_N_CTX" ]]       && ARGS+=("--n-ctx"        "$BIERGARTEN_N_CTX")
[[ -n "$BIERGARTEN_SEED" ]]        && ARGS+=("--seed"         "$BIERGARTEN_SEED")

# Extra args
[[ -n "$BIERGARTEN_EXTRA_ARGS" ]] && ARGS+=($BIERGARTEN_EXTRA_ARGS)

echo "--- Executing: $EXECUTABLE ${ARGS[*]} ---"

exec "$EXECUTABLE" "${ARGS[@]}"
