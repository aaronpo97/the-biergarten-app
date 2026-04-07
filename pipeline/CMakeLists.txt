cmake_minimum_required(VERSION 3.24)
project(biergarten-pipeline)
# =============================================================================
# 1. GPU Detection
# =============================================================================
# GGML_CUDA / GGML_METAL are set here so that the llama.cpp FetchContent below
# inherits them as cache variables before its CMakeLists.txt is processed.
if(APPLE)
    message(STATUS "[biergarten] Apple Silicon detected — enabling Metal acceleration.")
    set(GGML_METAL ON CACHE BOOL "Enable Metal for Apple Silicon" FORCE)
elseif(UNIX AND NOT APPLE)
    find_package(CUDAToolkit QUIET)
    if(CUDAToolkit_FOUND)
        message(STATUS "[biergarten] NVIDIA GPU detected — enabling CUDA acceleration.")
        set(GGML_CUDA ON CACHE BOOL "Enable CUDA for NVIDIA GPUs" FORCE)
        # 'native' resolves to the exact SM version of the present GPU at configure time
        # (e.g. sm_89 for RTX 2000 Ada). Change to a concrete arch list for cross-compilation.
        set(CMAKE_CUDA_ARCHITECTURES native)
    else()
        message(STATUS "[biergarten] No NVIDIA GPU found — falling back to CPU.")
    endif()
endif()
# =============================================================================
# 2. Project-wide Settings
# =============================================================================
set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
# =============================================================================
# 3. Dependencies
# =============================================================================
include(FetchContent)
# --- libcurl ------------------------------------------------------------------
# Prefer the system package; the build will fail at link time if absent and
# no system curl is found, so emit a fatal error early rather than a silent gap.
find_package(CURL QUIET)
if(NOT CURL_FOUND)
    message(FATAL_ERROR
        "[biergarten] libcurl not found. Install it via your package manager "
        "(e.g. 'sudo dnf install libcurl-devel') or set CURL_ROOT.")
endif()
# --- llama.cpp ----------------------------------------------------------------
# Pinned to a specific commit for reproducible builds.
# To update: pick a new commit SHA from https://github.com/ggml-org/llama.cpp
FetchContent_Declare(
    llama-cpp
    GIT_REPOSITORY https://github.com/ggml-org/llama.cpp.git
    GIT_TAG        b8611
)
FetchContent_MakeAvailable(llama-cpp)
# --- Boost (JSON + program_options) ------------------------------------------
FetchContent_Declare(
    boost
    URL https://github.com/boostorg/boost/releases/download/boost-1.85.0/boost-1.85.0-cmake.tar.gz
)
FetchContent_MakeAvailable(boost)
# --- spdlog -------------------------------------------------------------------
FetchContent_Declare(
    spdlog
    GIT_REPOSITORY https://github.com/gabime/spdlog.git
    GIT_TAG        v1.15.3
)
FetchContent_MakeAvailable(spdlog)
# =============================================================================
# 4. Sources
# =============================================================================
set(SOURCES
    src/main.cpp
    src/biergarten_data_generator.cpp
    src/data_generation/llama/destructor.cpp
    src/data_generation/llama/generate_brewery.cpp
    src/data_generation/llama/generate_user.cpp
    src/data_generation/llama/helpers.cpp
    src/data_generation/llama/infer.cpp
    src/data_generation/llama/load.cpp
    src/data_generation/llama/load_brewery_prompt.cpp
    src/data_generation/llama/set_sampling_options.cpp
    src/data_generation/mock/data.cpp
    src/data_generation/mock/deterministic_hash.cpp
    src/data_generation/mock/generate_brewery.cpp
    src/data_generation/mock/generate_user.cpp
    src/data_generation/mock/load.cpp
    src/json_handling/json_loader.cpp
    src/web_client/curl_web_client.cpp
    src/wikipedia/wikipedia_service.cpp
)
# =============================================================================
# 5. Target
# =============================================================================
add_executable(${PROJECT_NAME}
    ${SOURCES}
)
target_include_directories(${PROJECT_NAME} PRIVATE
    includes
    ${llama-cpp_SOURCE_DIR}/include
    ${llama-cpp_SOURCE_DIR}/common
)
target_link_libraries(${PROJECT_NAME} PRIVATE
    llama
    boost_json
    boost_program_options
    spdlog::spdlog
    CURL::libcurl
)
