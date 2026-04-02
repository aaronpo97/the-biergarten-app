cmake_minimum_required(VERSION 3.20)
project(biergarten-pipeline VERSION 0.1.0 LANGUAGES CXX)

# Allows older dependencies to configure on newer CMake.
set(CMAKE_POLICY_VERSION_MINIMUM 3.5)

# Policies
cmake_policy(SET CMP0167 NEW) # FindBoost improvements

# Global Settings
set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# -----------------------------------------------------------------------------
# Compiler Options & Warnings (Interface Library)
# -----------------------------------------------------------------------------
add_library(project_options INTERFACE)
target_compile_options(project_options INTERFACE
    $<$<CXX_COMPILER_ID:GNU,Clang>:
        -Wall -Wextra -Wpedantic -Wshadow -Wconversion -Wsign-conversion -Wunused
    >
    $<$<CXX_COMPILER_ID:MSVC>:
        /W4 /WX /permissive-
    >
)

# -----------------------------------------------------------------------------
# Dependencies
# -----------------------------------------------------------------------------
find_package(CURL REQUIRED)
find_package(SQLite3 REQUIRED)
find_package(Boost 1.75 REQUIRED COMPONENTS program_options json)

include(FetchContent)

# spdlog (Logging)
FetchContent_Declare(
    spdlog
    GIT_REPOSITORY https://github.com/gabime/spdlog.git
    GIT_TAG        v1.11.0
)
FetchContent_MakeAvailable(spdlog)

# llama.cpp (LLM Inference)
set(LLAMA_BUILD_TESTS OFF CACHE BOOL "" FORCE)
set(LLAMA_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)
set(LLAMA_BUILD_SERVER OFF CACHE BOOL "" FORCE)
FetchContent_Declare(
    llama_cpp
    GIT_REPOSITORY https://github.com/ggerganov/llama.cpp.git
    GIT_TAG        b8611
)
FetchContent_MakeAvailable(llama_cpp)

if(TARGET llama)
    target_compile_options(llama PRIVATE
        $<$<CXX_COMPILER_ID:AppleClang>:-include algorithm>
    )
endif()

# -----------------------------------------------------------------------------
# Main Executable
# -----------------------------------------------------------------------------
set(PIPELINE_SOURCES
    src/curl_web_client.cpp
    src/data_downloader.cpp
    src/database.cpp
    src/json_loader.cpp
    src/llama_generator.cpp
    src/mock_generator.cpp
    src/stream_parser.cpp
    src/wikipedia_service.cpp
    src/main.cpp
)

add_executable(biergarten-pipeline ${PIPELINE_SOURCES})

target_include_directories(biergarten-pipeline
    PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/includes
        ${llama_cpp_SOURCE_DIR}/include
)

target_link_libraries(biergarten-pipeline
    PRIVATE
        project_options
        CURL::libcurl
        SQLite::SQLite3
        spdlog::spdlog
        llama
        Boost::program_options
        Boost::json
)

# -----------------------------------------------------------------------------
# Post-Build Steps & Utilities
# -----------------------------------------------------------------------------
add_custom_command(TARGET biergarten-pipeline POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E make_directory ${CMAKE_CURRENT_SOURCE_DIR}/output
    COMMENT "Ensuring output directory exists"
)

find_program(VALGRIND valgrind)
if(VALGRIND)
    add_custom_target(memcheck
        COMMAND ${VALGRIND} --leak-check=full --error-exitcode=1 $<TARGET_FILE:biergarten-pipeline> --help
        DEPENDS biergarten-pipeline
        COMMENT "Running Valgrind memory check"
    )
endif()
