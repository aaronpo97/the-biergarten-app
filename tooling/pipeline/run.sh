./biergarten-pipeline \
    --model ../models/google_gemma-4-E4B-it-Q6_K.gguf \
    --temperature 1.0 \
    --top-p 0.95 \
    --top-k 64 \
    --n-ctx 8192 \
    --location-count 15 \
    --prompt-dir ../prompts
