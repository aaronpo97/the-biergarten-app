cmake_minimum_required(VERSION 3.20)
project(biergarten-pipeline VERSION 0.1.0 LANGUAGES CXX)

cmake_policy(SET CMP0167 NEW)

set(CMAKE_CXX_STANDARD 23)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

find_package(CURL REQUIRED)
find_package(Boost REQUIRED COMPONENTS unit_test_framework)
find_package(SQLite3 REQUIRED)

include(FetchContent)

# RapidJSON (header-only) for true SAX parsing
# Using direct header-only approach without CMakeLists.txt
FetchContent_Declare(
    rapidjson
    GIT_REPOSITORY https://github.com/Tencent/rapidjson.git
    GIT_TAG        v1.1.0
    SOURCE_SUBDIR  ""  # Don't use RapidJSON's CMakeLists.txt
)
FetchContent_GetProperties(rapidjson)
if(NOT rapidjson_POPULATED)
    FetchContent_Populate(rapidjson)
    # RapidJSON is header-only; just make include path available
endif()

# spdlog (logging)
FetchContent_Declare(
    spdlog
    GIT_REPOSITORY https://github.com/gabime/spdlog.git
    GIT_TAG        v1.11.0
)
FetchContent_GetProperties(spdlog)
if(NOT spdlog_POPULATED)
    FetchContent_Populate(spdlog)
    add_subdirectory(${spdlog_SOURCE_DIR} ${spdlog_BINARY_DIR} EXCLUDE_FROM_ALL)
endif()

file(GLOB_RECURSE SOURCES CONFIGURE_DEPENDS
    src/*.cpp
)

add_executable(biergarten-pipeline ${SOURCES})

target_include_directories(biergarten-pipeline
    PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}/includes
        ${rapidjson_SOURCE_DIR}/include
)

target_link_libraries(biergarten-pipeline
    PRIVATE
        CURL::libcurl
        Boost::unit_test_framework
        SQLite::SQLite3
    spdlog::spdlog
)

target_compile_options(biergarten-pipeline PRIVATE
    $<$<CXX_COMPILER_ID:GNU,Clang>:
        -Wall
        -Wextra
        -Wpedantic
        -Wshadow
        -Wconversion
        -Wsign-conversion
    >
    $<$<CXX_COMPILER_ID:MSVC>:
        /W4
        /WX
    >
)

add_custom_command(TARGET biergarten-pipeline POST_BUILD
    COMMAND ${CMAKE_COMMAND} -E make_directory
        ${CMAKE_CURRENT_SOURCE_DIR}/output
    COMMENT "Creating output/ directory for seed SQL files"
)

find_program(VALGRIND valgrind)
if(VALGRIND)
    add_custom_target(memcheck
        COMMAND ${VALGRIND}
            --leak-check=full
            --error-exitcode=1
            $<TARGET_FILE:biergarten-pipeline> --help
        DEPENDS biergarten-pipeline
        COMMENT "Running Valgrind memcheck"
    )
endif()

include(CTest)

if(BUILD_TESTING)
   find_package(Boost REQUIRED COMPONENTS unit_test_framework)

   file(GLOB_RECURSE TEST_SOURCES CONFIGURE_DEPENDS
      tests/*.cpp
      tests/*.cc
      tests/*.cxx
   )

   if(TEST_SOURCES)
      add_executable(biergarten-pipeline-tests ${TEST_SOURCES})

      target_include_directories(biergarten-pipeline-tests
         PRIVATE
            ${CMAKE_CURRENT_SOURCE_DIR}/include
      )

      target_link_libraries(biergarten-pipeline-tests
         PRIVATE
            Boost::unit_test_framework
            CURL::libcurl
            nlohmann_json::nlohmann_json
            llama
      )

      add_test(
         NAME biergarten-pipeline-tests
         COMMAND biergarten-pipeline-tests
      )
   endif()
endif()
