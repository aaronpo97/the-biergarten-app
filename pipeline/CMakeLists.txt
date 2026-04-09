cmake_minimum_required(VERSION 3.24)
project(biergarten-pipeline)
# =============================================================================
# 1. GPU Detection
# =============================================================================
# GGML_CUDA / GGML_METAL are set here so that the llama.cpp FetchContent below
# inherits them as cache variables before its CMakeLists.txt is processed.
# =============================================================================
# 1. Platform & GPU Detection
# =============================================================================

if(APPLE)
    # Check if this is an M-series Mac (arm64) or Intel Mac (x86_64)
    if(CMAKE_SYSTEM_PROCESSOR MATCHES "arm64")
        message(STATUS "[biergarten] Apple Silicon detected — enabling Metal acceleration.")
        set(GGML_METAL ON CACHE BOOL "Enable Metal for Apple Silicon" FORCE)
    else()
        message(STATUS "[biergarten] Intel Mac detected — using CPU / Accelerate framework.")
        # Explicitly turn off Metal so the build doesn't fail on x86_64
        set(GGML_METAL OFF CACHE BOOL "Disable Metal for Intel Macs" FORCE)
        # Note: llama.cpp will automatically detect and enable Apple's Accelerate framework here
    endif()

elseif(UNIX AND NOT APPLE)
    # Search for NVIDIA CUDA Toolkit
    find_package(CUDAToolkit QUIET)

    # Search for AMD HIP/ROCm Toolkit
    find_package(HIP QUIET)

    if(CUDAToolkit_FOUND)
        message(STATUS "[biergarten] NVIDIA GPU detected — enabling CUDA acceleration.")
        set(GGML_CUDA ON CACHE BOOL "Enable CUDA for NVIDIA GPUs" FORCE)
        set(CMAKE_CUDA_ARCHITECTURES native)

    elseif(HIP_FOUND OR EXISTS "/opt/rocm")
        message(STATUS "[biergarten] AMD GPU detected — enabling HIP/ROCm acceleration.")
        set(GGML_HIPBLAS ON CACHE BOOL "Enable HIP for AMD GPUs" FORCE)

    else()
        message(STATUS "[biergarten] No NVIDIA or AMD GPU found — falling back to CPU.")
    endif()

else()
    message(FATAL_ERROR "[biergarten] Unrecognized platform. Windows is currently not supported.")
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
FetchContent_Declare(
    llama-cpp
    GIT_REPOSITORY https://github.com/ggml-org/llama.cpp.git
    GIT_TAG        b8711
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
    # BiergartenDataGenerator methods
    src/biergarten_data_generator/constructor.cpp
    src/biergarten_data_generator/run.cpp
    src/biergarten_data_generator/initialize_generator.cpp
    src/biergarten_data_generator/query_cities_with_countries.cpp
    src/biergarten_data_generator/enrich_with_wikipedia.cpp
    src/biergarten_data_generator/generate_breweries.cpp
    src/biergarten_data_generator/log_results.cpp
    # WikipediaService methods
    src/wikipedia/constructor.cpp
    src/wikipedia/get_summary.cpp
    src/wikipedia/fetch_extract.cpp
    # CURLWebClient and CurlGlobalState methods
    src/web_client/curl_global_state_constructor.cpp
    src/web_client/curl_global_state_destructor.cpp
    src/web_client/curl_web_client_constructor.cpp
    src/web_client/curl_web_client_destructor.cpp
    src/web_client/curl_web_client_download_to_file.cpp
    src/web_client/curl_web_client_get.cpp
    src/web_client/curl_web_client_url_encode.cpp
    # Data generation modules
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

# =============================================================================
# 6. Runtime Assets
# =============================================================================
# Make locations.json available in the build directory for runtime relative path
# lookups (e.g. when running from ./build).
configure_file(
    ${CMAKE_SOURCE_DIR}/locations.json
    ${CMAKE_BINARY_DIR}/locations.json
    COPYONLY
)
