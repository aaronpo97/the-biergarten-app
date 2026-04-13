cmake_minimum_required(VERSION 3.24)
project(biergarten-pipeline)

set(CMAKE_POLICY_VERSION_MINIMUM 3.5 CACHE STRING "" FORCE)

# =============================================================================
# 1. Platform & GPU Detection
# =============================================================================
if(WIN32)
    message(FATAL_ERROR "[biergarten] Windows is currently not supported. Please use Linux (Fedora 43) or macOS (M1 Pro).")
endif()

if(APPLE)
    if(CMAKE_SYSTEM_PROCESSOR MATCHES "arm64")
        message(STATUS "[biergarten] Apple Silicon detected — enabling Metal acceleration.")
        set(GGML_METAL ON CACHE BOOL "Enable Metal for Apple Silicon" FORCE)
    else()
        message(STATUS "[biergarten] Intel Mac detected — using CPU / Accelerate framework.")
        set(GGML_METAL OFF CACHE BOOL "Disable Metal for Intel Macs" FORCE)
    endif()
elseif(UNIX AND NOT APPLE)
    find_package(CUDAToolkit QUIET)
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
endif()

# =============================================================================
# 2. Project-wide Settings (Standard & Optimization)
# =============================================================================

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

add_compile_options(-Wall -Wextra -Werror -Wpedantic)

# Release Build Optimization: Aggressive (-O3), Arch-specific, and LTO
set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} -O3 -march=native -flto")

set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -Og -g")

# =============================================================================
# 3. Dependencies
# =============================================================================
include(FetchContent)

find_package(CURL QUIET)
if(NOT CURL_FOUND)
    message(FATAL_ERROR "[biergarten] libcurl not found. Install it (e.g. 'sudo dnf install libcurl-devel').")
endif()

# Require system Boost for JSON and Program Options to speed up build times
find_package(Boost REQUIRED COMPONENTS json program_options)

FetchContent_Declare(
    llama-cpp
    GIT_REPOSITORY https://github.com/ggml-org/llama.cpp.git
    GIT_TAG        b8739
)
FetchContent_MakeAvailable(llama-cpp)

FetchContent_Declare(
    boost-di
    GIT_REPOSITORY https://github.com/boost-ext/di.git
    GIT_TAG        v1.3.0
)
FetchContent_MakeAvailable(boost-di)
if(TARGET Boost.DI AND NOT TARGET boost::di)
    add_library(boost::di ALIAS Boost.DI)
endif()

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
    src/main.cc
    src/biergarten_data_generator/biergarten_data_generator.cc
    src/biergarten_data_generator/run.cc
    src/biergarten_data_generator/query_cities_with_countries.cc
    src/biergarten_data_generator/generate_breweries.cc
    src/biergarten_data_generator/log_results.cc
    src/services/wikipedia/wikipedia_service.cc
    src/services/wikipedia/get_summary.cc
    src/services/wikipedia/fetch_extract.cc
    src/web_client/curl_global_state.cc
    src/web_client/curl_web_client_get.cc
    src/web_client/curl_web_client_url_encode.cc
    src/data_generation/llama/llama_generator.cc
    src/data_generation/llama/generate_brewery.cc
    src/data_generation/llama/generate_user.cc
    src/data_generation/llama/helpers.cc
    src/data_generation/llama/infer.cc
    src/data_generation/llama/load.cc
    src/data_generation/llama/load_brewery_prompt.cc
    src/data_generation/mock/deterministic_hash.cc
    src/data_generation/mock/generate_brewery.cc
    src/data_generation/mock/generate_user.cc
    src/json_handling/json_loader.cc
)

# =============================================================================
# 5. Target
# =============================================================================
add_executable(${PROJECT_NAME} ${SOURCES})
target_include_directories(${PROJECT_NAME} PRIVATE
    includes
    ${llama-cpp_SOURCE_DIR}/include
    ${llama-cpp_SOURCE_DIR}/common
)
target_link_libraries(${PROJECT_NAME} PRIVATE
    llama
    boost::di
    Boost::json
    Boost::program_options
    spdlog::spdlog
    CURL::libcurl
)

# =============================================================================
# 6. Runtime Assets
# =============================================================================
configure_file(
    ${CMAKE_SOURCE_DIR}/locations.json
    ${CMAKE_BINARY_DIR}/locations.json
    COPYONLY
)

add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E copy_directory
        ${CMAKE_SOURCE_DIR}/prompts
        ${CMAKE_BINARY_DIR}/prompts
)
