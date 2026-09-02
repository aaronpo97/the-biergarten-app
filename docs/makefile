# Makefile for rendering all Mermaid (.mmd) diagrams to SVG,
# preserving the source directory structure under OUT_ROOT.
#
# Usage:
#   make            # render all diagrams
#   make clean      # remove all rendered output
#   make FORMAT=png # render as PNG instead of SVG
#   make FORMAT=pdf # render as PDF instead of SVG
#
# Requires: @mermaid-js/mermaid-cli (mmdc) on PATH
#   npm install -g @mermaid-js/mermaid-cli

SRC_ROOT  := .
OUT_ROOT  := rendered-diagrams
FORMAT    := svg

# Optional: point to a shared Mermaid config/theme file if you have one.
# CONFIG    := ./mermaidconfig.json
# CONFIG_FLAG := -c $(CONFIG)
CONFIG_FLAG :=

# Find every .mmd file under SRC_ROOT, excluding the output directory itself.
SRC_FILES := $(shell find $(SRC_ROOT) -type f -name "*.mmd" -not -path "./$(OUT_ROOT)/*")

# Map each source file to its corresponding output file, preserving subdirectories.
OUT_FILES := $(patsubst $(SRC_ROOT)/%.mmd,$(OUT_ROOT)/%.$(FORMAT),$(SRC_FILES))

.PHONY: all clean list

all: $(OUT_FILES)

# Pattern rule: build any output file from its matching .mmd source file,
# creating the destination subdirectory as needed.
$(OUT_ROOT)/%.$(FORMAT): $(SRC_ROOT)/%.mmd
	@mkdir -p $(dir $@)
	mmdc $(CONFIG_FLAG) -i $< -o $@

clean:
	rm -rf $(OUT_ROOT)

# Debug helper: print which source files were discovered.
list:
	@echo "$(SRC_FILES)" | tr ' ' '\n'
