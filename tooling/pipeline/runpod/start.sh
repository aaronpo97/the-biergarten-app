#!/bin/bash
set -e

# Configuration / Defaults
MODEL_PATH="${BIERGARTEN_MODEL_PATH:-/workspace/models/google_gemma-4-E4B-it-Q6_K.gguf}"
OUTPUT_DIR="${BIERGARTEN_OUTPUT_DIR:-/workspace/output}"
LOG_PATH="${BIERGARTEN_LOG_PATH:-/workspace/logs/pipeline.log}"
EXECUTABLE="/workspace/app/build/biergarten-pipeline"
PROMPT_DIR="/workspace/app/build/prompts"

echo "--- Starting Biergarten Pipeline Environment Check ---"

# 1. Ensure volume mount directories exist
mkdir -p "$OUTPUT_DIR"
mkdir -p "$(dirname "$LOG_PATH")"

# 2. Check for model file
if [ ! -f "$MODEL_PATH" ]; then
    echo "ERROR: Model not found at $MODEL_PATH"
    echo "Current /workspace/models contents:"
    ls -lh /workspace/models 2>/dev/null || echo "(directory does not exist)"
    exit 1
fi

# 3. Build the command arguments
ARGS=(
    "--model"      "$MODEL_PATH"
    "--prompt-dir" "$PROMPT_DIR"
    "--output"     "$OUTPUT_DIR"
    "--log-path"   "$LOG_PATH"
)

# Optional hyperparameters
[[ -n "$BIERGARTEN_TEMPERATURE" ]] && ARGS+=("--temperature"  "$BIERGARTEN_TEMPERATURE")
[[ -n "$BIERGARTEN_TOP_P" ]]       && ARGS+=("--top-p"        "$BIERGARTEN_TOP_P")
[[ -n "$BIERGARTEN_TOP_K" ]]       && ARGS+=("--top-k"        "$BIERGARTEN_TOP_K")
[[ -n "$BIERGARTEN_N_CTX" ]]       && ARGS+=("--n-ctx"        "$BIERGARTEN_N_CTX")
[[ -n "$BIERGARTEN_SEED" ]]        && ARGS+=("--seed"         "$BIERGARTEN_SEED")
[[ -n "$BIERGARTEN_GL_LAYERS" ]]   && ARGS+=("--n-gpu-layers" "$BIERGARTEN_GL_LAYERS")

# Append any extra custom args
if [[ -n "$BIERGARTEN_EXTRA_ARGS" ]]; then
    ARGS+=($BIERGARTEN_EXTRA_ARGS)
fi

echo "--- Executing: $EXECUTABLE ${ARGS[*]} ---"

# Execute the binary directly, replacing the shell process
exec "$EXECUTABLE" "${ARGS[@]}"
