#!/bin/bash

SKIP_CONFIRM=false
if [[ "$1" == "-y" ]]; then
    SKIP_CONFIRM=true
fi

echo "WARNING: This script will format all .cpp, .h, .cxx, .cc .c, .hpp files in the src and includes directories."
echo "This script will overwrite the files with the formatted version."

if [[ "$SKIP_CONFIRM" == false ]]; then
    read -p "Do you want to continue? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Aborted."
        exit 1
    fi
fi

if [ ! -f .clang-format ]; then
    echo "ERROR: .clang-format file not found."
    exit 1
fi

if ! command -v clang-format &>/dev/null; then
    echo "ERROR: clang-format not found."
    exit 1
fi

echo "Formatting files..."

find includes src \( -name "*.cpp" -o -name "*.hpp" -o -name "*.h" -o -name "*.c"  -o -name "*.cc" -o -name "*.cxx" \) | xargs clang-format -i

echo "Done."

exit 0

