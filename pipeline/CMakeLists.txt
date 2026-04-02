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

option(ENABLE_CLANG_TIDY "Enable clang-tidy static analysis for project targets" ON)
option(ENABLE_CLANG_FORMAT_TARGETS "Enable clang-format helper targets" ON)

if(ENABLE_CLANG_TIDY)
    find_program(CLANG_TIDY_EXE NAMES clang-tidy)
    if(CLANG_TIDY_EXE)
        set(BIERGARTEN_CLANG_TIDY_COMMAND
            "${CLANG_TIDY_EXE};--config-file=${CMAKE_CURRENT_SOURCE_DIR}/.clang-tidy")
        message(STATUS "clang-tidy enabled: ${CLANG_TIDY_EXE}")
    else()
        message(STATUS "clang-tidy not found; static analysis is disabled")
    endif()
endif()

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
    src/biergarten_data_generator.cpp
    src/web_client/curl_web_client.cpp
    src/data_generation/data_downloader.cpp
    src/database/database.cpp
    src/json_handling/json_loader.cpp
    src/data_generation/llama_generator.cpp
    src/data_generation/mock_generator.cpp
    src/json_handling/stream_parser.cpp
    src/wikipedia/wikipedia_service.cpp
    src/main.cpp
)

add_executable(biergarten-pipeline ${PIPELINE_SOURCES})

if(BIERGARTEN_CLANG_TIDY_COMMAND)
    set_target_properties(biergarten-pipeline PROPERTIES
        CXX_CLANG_TIDY "${BIERGARTEN_CLANG_TIDY_COMMAND}"
    )
endif()

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

if(ENABLE_CLANG_FORMAT_TARGETS)
    find_program(CLANG_FORMAT_EXE NAMES clang-format)
    if(CLANG_FORMAT_EXE)
        file(GLOB_RECURSE FORMAT_SOURCES CONFIGURE_DEPENDS
            ${CMAKE_CURRENT_SOURCE_DIR}/src/**/*.cpp
            ${CMAKE_CURRENT_SOURCE_DIR}/src/**/*.cc
            ${CMAKE_CURRENT_SOURCE_DIR}/includes/**/*.h
            ${CMAKE_CURRENT_SOURCE_DIR}/includes/**/*.hpp
        )

        add_custom_target(format
            COMMAND ${CLANG_FORMAT_EXE} -style=file -i ${FORMAT_SOURCES}
            COMMENT "Formatting source files with clang-format (Google style)"
            VERBATIM
        )

        add_custom_target(format-check
            COMMAND ${CLANG_FORMAT_EXE} -style=file --dry-run --Werror ${FORMAT_SOURCES}
            COMMENT "Checking source formatting with clang-format (Google style)"
            VERBATIM
        )
    else()
        message(STATUS "clang-format not found; format targets are disabled")
    endif()
endif()

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
