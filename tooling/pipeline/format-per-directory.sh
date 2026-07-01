#!/bin/bash
#
# Walks every directory under src/ and includes/ (including nested
# subdirectories), runs clang-format on the C/C++ files in that directory
# only (non-recursive), and commits the result with its own commit.
#
# Usage: ./format-per-directory.sh [-y]
#   -y  skip the confirmation prompt

set -euo pipefail

SKIP_CONFIRM=false
if [[ "${1:-}" == "-y" ]]; then
    SKIP_CONFIRM=true
fi

cd "$(dirname "$0")"

if [ ! -f .clang-format ]; then
    echo "ERROR: .clang-format file not found."
    exit 1
fi

if ! command -v clang-format &>/dev/null; then
    echo "ERROR: clang-format not found."
    exit 1
fi

if ! command -v git &>/dev/null; then
    echo "ERROR: git not found."
    exit 1
fi

echo "WARNING: This script will format .cpp, .h, .cxx, .cc, .c, .hpp files"
echo "directory-by-directory under src/ and includes/, committing after each"
echo "directory is formatted."

if [[ "$SKIP_CONFIRM" == false ]]; then
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

if [[ -n "$(git status --porcelain)" ]]; then
    echo "ERROR: working tree is not clean. Commit or stash your changes first."
    exit 1
fi

dirs=$(find src includes -type d | sort)

for dir in $dirs; do
    files=$(find "$dir" -maxdepth 1 -type f \( -name "*.cpp" -o -name "*.hpp" -o -name "*.h" -o -name "*.c" -o -name "*.cc" -o -name "*.cxx" \))

    if [[ -z "$files" ]]; then
        continue
    fi

    echo "Formatting $dir..."
    echo "$files" | xargs clang-format -i

    if [[ -n "$(git status --porcelain -- "$dir")" ]]; then
        git add -- "$dir"
        git commit -m "Formatted $dir"
    else
        echo "No changes in $dir, skipping commit."
    fi
done

echo "Done."
