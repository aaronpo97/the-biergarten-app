cmake_minimum_required(VERSION 3.31)
project(biergarten-pipeline)

# 1. Build Options

option(BIERGARTEN_MOCK_ONLY "Build with mock data generators only — skips llama.cpp" OFF)
if (BIERGARTEN_MOCK_ONLY)
    message(STATUS "[biergarten] MOCK_ONLY build — llama.cpp will not be compiled.")
endif ()

# 2. Platform & GPU Detection
if (NOT UNIX)
    message(FATAL_ERROR "[biergarten] Windows is not supported. Please use Linux (Fedora 43) or macOS (M1 Pro).")
endif ()

if (APPLE)
    if (CMAKE_SYSTEM_PROCESSOR MATCHES "arm64")
        message(STATUS "[biergarten] Apple Silicon detected — enabling Metal acceleration.")
        set(GGML_METAL ON CACHE BOOL "Enable Metal for Apple Silicon" FORCE)
    else ()
        message(STATUS "[biergarten] Intel Mac detected — using CPU / Accelerate framework.")
        set(GGML_METAL OFF CACHE BOOL "Disable Metal for Intel Macs" FORCE)
    endif ()
else ()
    find_package(CUDAToolkit QUIET)
    find_package(hip CONFIG QUIET)

    if (CUDAToolkit_FOUND)
        message(STATUS "[biergarten] NVIDIA GPU detected — enabling CUDA acceleration.")
        set(GGML_CUDA ON CACHE BOOL "Enable CUDA for NVIDIA GPUs" FORCE)
        set(CMAKE_CUDA_ARCHITECTURES native)
    elseif (hip_FOUND OR DEFINED ENV{ROCM_PATH} OR EXISTS "/opt/rocm")
        message(STATUS "[biergarten] AMD GPU detected — enabling HIP/ROCm acceleration.")
        set(GGML_HIPBLAS ON CACHE BOOL "Enable HIP for AMD GPUs" FORCE)
    else ()
        message(STATUS "[biergarten] No NVIDIA or AMD GPU found — falling back to CPU.")
    endif ()
endif ()

# 3. Project-wide Settings
set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)
set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} -O3 -march=native -flto")
set(CMAKE_CXX_FLAGS_DEBUG "${CMAKE_CXX_FLAGS_DEBUG} -Og -g")

# 4. Dependencies
include(FetchContent)

# Boost (system install — via dnf/brew)
find_package(Boost REQUIRED COMPONENTS json program_options)

# Boost.DI (unofficial Boost extension, must declare separately from main Boost dependency)
FetchContent_Declare(
        boost-di
        GIT_REPOSITORY https://github.com/boost-ext/di.git
        GIT_TAG v1.3.0
)
FetchContent_MakeAvailable(boost-di)
if (TARGET Boost.DI AND NOT TARGET boost::di)
    add_library(boost::di ALIAS Boost.DI)
endif ()

# SQLite amalgamation
FetchContent_Declare(
        sqlite_amalgamation
        URL https://www.sqlite.org/2026/sqlite-amalgamation-3530000.zip
        URL_HASH SHA3_256=c2325c53b3b41761469f91cfb078e96882ac5d85bac10c11b0bd8f253b031e5b
        EXCLUDE_FROM_ALL
)
FetchContent_MakeAvailable(sqlite_amalgamation)
if (NOT TARGET sqlite3)
    add_library(sqlite3 STATIC ${sqlite_amalgamation_SOURCE_DIR}/sqlite3.c)
    target_include_directories(sqlite3 PUBLIC ${sqlite_amalgamation_SOURCE_DIR})
    target_compile_definitions(sqlite3 PUBLIC SQLITE_THREADSAFE=1)
endif ()

# llama.cpp — skipped for mock-only builds
if (NOT BIERGARTEN_MOCK_ONLY)
    FetchContent_Declare(
            llama-cpp
            GIT_REPOSITORY https://github.com/ggml-org/llama.cpp.git
            GIT_TAG b8742
    )
    FetchContent_MakeAvailable(llama-cpp)
endif ()

# spdlog
FetchContent_Declare(
        spdlog
        GIT_REPOSITORY https://github.com/gabime/spdlog.git
        GIT_TAG v1.15.3
)
FetchContent_MakeAvailable(spdlog)

# cpp-httplib — header-only HTTP/HTTPS client replacing libcurl.
# OpenSSL is required for HTTPS (Wikipedia API). find_package locates
# libssl/libcrypto; HTTPLIB_REQUIRE_OPENSSL causes a hard build failure
# if OpenSSL is absent rather than silently producing an HTTP-only binary.
find_package(OpenSSL REQUIRED)
FetchContent_Declare(
        cpp-httplib
        GIT_REPOSITORY https://github.com/yhirose/cpp-httplib.git
        GIT_TAG v0.43.2
        GIT_SHALLOW TRUE
        SYSTEM
)
set(HTTPLIB_REQUIRE_OPENSSL ON CACHE BOOL "Require OpenSSL for cpp-httplib" FORCE)
FetchContent_MakeAvailable(cpp-httplib)

# 5. Executable & Sources
add_executable(${PROJECT_NAME})

# --- Entry point ---
target_sources(${PROJECT_NAME} PRIVATE
        src/main.cc
)

# --- json_handling ---
target_sources(${PROJECT_NAME} PRIVATE
        src/json_handling/json_loader.cc
)

# --- application_options ---
target_sources(${PROJECT_NAME} PRIVATE
        src/application_options/parse_arguments.cc
)

# --- biergarten_data_generator ---
target_sources(${PROJECT_NAME} PRIVATE
        src/biergarten_data_generator/log_results.cc
        src/biergarten_data_generator/biergarten_data_generator.cc
        src/biergarten_data_generator/generate_breweries.cc
        src/biergarten_data_generator/run.cc
        src/biergarten_data_generator/query_cities_with_countries.cc
)

# --- web_client ---
target_sources(${PROJECT_NAME} PRIVATE
        src/web_client/http_web_client.cc
)

# --- data_generation: prompt_formatting ---
target_sources(${PROJECT_NAME} PRIVATE
        src/data_generation/prompt_formatting/gemma4_jinja_prompt_formatter.cc
)

# --- data_generation: mock ---
target_sources(${PROJECT_NAME} PRIVATE
        src/data_generation/mock/generate_brewery.cc
        src/data_generation/mock/generate_user.cc
        src/data_generation/mock/deterministic_hash.cc
)

# --- data_generation: llama (skipped for mock-only builds) ---
if (NOT BIERGARTEN_MOCK_ONLY)
    target_sources(${PROJECT_NAME} PRIVATE
            src/data_generation/llama/load.cc
            src/data_generation/llama/helpers.cc
            src/data_generation/llama/generate_brewery.cc
            src/data_generation/llama/infer.cc
            src/data_generation/llama/llama_generator.cc
            src/data_generation/llama/generate_user.cc
    )
endif ()

# --- services: wikipedia ---
target_sources(${PROJECT_NAME} PRIVATE
        src/services/wikipedia/wikipedia_service.cc
        src/services/wikipedia/fetch_extract.cc
        src/services/wikipedia/get_summary.cc
)

# --- services: sqlite ---
target_sources(${PROJECT_NAME} PRIVATE
        src/services/sqlite/process_record.cc
        src/services/sqlite/sqlite_export_service.cc
        src/services/sqlite/finalize.cc
        src/services/sqlite/initialize.cc
        src/services/sqlite/helpers/sqlite_connection_helpers.cc
        src/services/sqlite/helpers/sqlite_statement_helpers.cc
)

# --- services (top-level) ---
target_sources(${PROJECT_NAME} PRIVATE
        src/services/prompt_directory.cc
)

# 6. Include Directories, Link Libraries & Compile Definitions
target_include_directories(${PROJECT_NAME} PRIVATE
        includes
        $<$<NOT:$<BOOL:${BIERGARTEN_MOCK_ONLY}>>:${llama-cpp_SOURCE_DIR}/include>
        $<$<NOT:$<BOOL:${BIERGARTEN_MOCK_ONLY}>>:${llama-cpp_SOURCE_DIR}/common>
)

target_link_libraries(${PROJECT_NAME} PRIVATE
        $<$<NOT:$<BOOL:${BIERGARTEN_MOCK_ONLY}>>:llama>
        boost::di
        Boost::json
        Boost::program_options
        spdlog::spdlog
        sqlite3
        httplib::httplib
        OpenSSL::SSL
        OpenSSL::Crypto
)

target_compile_definitions(${PROJECT_NAME} PRIVATE
        # Defined when -DBIERGARTEN_MOCK_ONLY=ON — skips llama.cpp entirely.
        # Use #ifdef BIERGARTEN_MOCK_ONLY in source to guard llama-specific code.
        $<$<BOOL:${BIERGARTEN_MOCK_ONLY}>:BIERGARTEN_MOCK_ONLY>

        # Defined for Debug configuration builds.
        # Use #ifdef DEBUG in source to enable debug-only behaviour (e.g. verbose logging).
        $<$<CONFIG:Debug>:DEBUG>
)

# 7. Runtime Assets
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