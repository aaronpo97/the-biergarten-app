#include "services/logging/logger.h"
#include <iostream>

#include <optional>
#include <sstream>
#include <string>

#include "data_model/models.h"

std::optional<ApplicationOptions> ParseArguments(const int argc, char** argv,
                                                std::shared_ptr<ILogger> logger) {
  prog_opts::options_description desc("Pipeline Options");
  auto opt = desc.add_options();

  opt("help,h", "Produce help message");

  // Defaults sourced from SamplingOptions{} so the CLI and LlamaGenerator
  // share a single source of truth — changing the struct updates both.
  auto add_sampling_options = [&]() -> void {
    const SamplingOptions sampling_defaults{};
    opt("temperature",
        prog_opts::value<float>()->default_value(sampling_defaults.temperature),
        "Sampling temperature (higher = more random)");
    opt("top-p",
        prog_opts::value<float>()->default_value(sampling_defaults.top_p),
        "Nucleus sampling top-p in (0,1] (higher = more random)");
    opt("top-k",
        prog_opts::value<uint32_t>()->default_value(sampling_defaults.top_k),
        "Top-k sampling parameter (higher = more candidate tokens)");
    opt("n-ctx",
        prog_opts::value<uint32_t>()->default_value(sampling_defaults.n_ctx),
        "Context window size in tokens");
    opt("seed", prog_opts::value<int>()->default_value(sampling_defaults.seed),
        "Sampler seed: -1 for random, otherwise non-negative integer");
    opt("n-gpu-layers", prog_opts::value<int>()->default_value(0),
        "Number of layers to offload to GPU");
  };

  // --mocked and --model are mutually exclusive; validation is enforced below
  // rather than at registration to produce a clear diagnostic message.
  auto add_generator_options = [&]() -> void {
    opt("mocked", prog_opts::bool_switch(),
        "Use mocked generator for brewery/user data");
    opt("model,m", prog_opts::value<std::string>()->default_value(""),
        "Path to LLM model (gguf)");
  };

  auto add_pipeline_options = [&]() -> void {
    opt("output,o", prog_opts::value<std::string>()->default_value("output"),
        "Directory for generated artifacts");
    opt("log-path",
        prog_opts::value<std::string>()->default_value("pipeline.log"),
        "Path for application logs");
    opt("prompt-dir", prog_opts::value<std::string>()->default_value(""),
        "Directory containing named prompt files (e.g. BREWERY_GENERATION.md)."
        " Required when not using --mocked.");
    opt("location-count", prog_opts::value<uint32_t>()->default_value(10));
  };

  add_sampling_options();
  add_generator_options();
  add_pipeline_options();

  // No flags provided — treat as a help request rather than an error.
  if (argc == 1) {
    const std::string title = "Biergarten Pipeline";
    const std::string usage = ([&] {
      std::stringstream usage_stream;
      usage_stream << "\nUsage: biergarten-pipeline [options]\n\n" << desc;
      return usage_stream.str();
    })();
    if (logger) {
      logger->Log(LogLevel::Info, PipelinePhase::Startup, title);
      logger->Log(LogLevel::Info, PipelinePhase::Startup, usage);
    } else {
      std::cout << title << std::endl << usage << std::endl;
    }
    return std::nullopt;
  }

  try {
    prog_opts::variables_map var_map;
    prog_opts::store(prog_opts::parse_command_line(argc, argv, desc), var_map);
    prog_opts::notify(var_map);

    if (var_map.contains("help")) {
      std::stringstream help_stream;
      help_stream << "\n" << desc;
      if (logger) {
        logger->Log(LogLevel::Info, PipelinePhase::Startup, help_stream.str());
      } else {
        std::cout << help_stream.str() << std::endl;
      }
      return std::nullopt;
    }

    ApplicationOptions options;

    options.pipeline.output_path = var_map["output"].as<std::string>();
    options.pipeline.log_path = var_map["log-path"].as<std::string>();
    options.pipeline.prompt_dir = var_map["prompt-dir"].as<std::string>();
    options.pipeline.location_count =
      var_map["location-count"].as<uint32_t>();

    const bool use_mocked = var_map["mocked"].as<bool>();
    const std::string model_path = var_map["model"].as<std::string>();
    const int n_gpu_layers = var_map["n-gpu-layers"].as<int>();

    // Enforce mutual exclusivity before any further configuration is applied.
    if (use_mocked && !model_path.empty()) {
      const std::string msg =
          "Invalid arguments: --mocked and --model are mutually exclusive";
      if (logger) {
        logger->Log(LogLevel::Error, PipelinePhase::Startup, msg);
      } else {
        std::cerr << msg << std::endl;
      }
      return std::nullopt;
    }

    if (!use_mocked && model_path.empty()) {
      const std::string msg =
          "Invalid arguments: either --mocked or --model must be specified";
      if (logger) {
        logger->Log(LogLevel::Error, PipelinePhase::Startup, msg);
      } else {
        std::cerr << msg << std::endl;
      }
      return std::nullopt;
    }

    // Prompt directory is only meaningful for live inference — the mock
    // generator has no use for it and should not require it to be present.
    if (!use_mocked && options.pipeline.prompt_dir.empty()) {
      const std::string msg =
          "Invalid arguments: --prompt-dir is required when not using --mocked";
      if (logger) {
        logger->Log(LogLevel::Error, PipelinePhase::Startup, msg);
      } else {
        std::cerr << msg << std::endl;
      }
      return std::nullopt;
    }

    options.generator.use_mocked = use_mocked;
    options.generator.model_path = model_path;
    // options.generator.n_gpu_layers = n_gpu_layers;

    // Only populate sampling config when the user explicitly overrides at
    // least one value. Leaving it as std::nullopt lets LlamaGenerator fall
    // back to its own SamplingOptions{} defaults, keeping the two paths
    // consistent without redundant copies.
    const bool user_provided_sampling =
        !var_map["temperature"].defaulted() || !var_map["top-p"].defaulted() ||
        !var_map["top-k"].defaulted() || !var_map["n-ctx"].defaulted() ||
        !var_map["seed"].defaulted() || !var_map["n_gpu_layers"].defaulted();

    if (user_provided_sampling) {
      // Warn but do not fail — the run is still valid, the flags are just
      // silently irrelevant when no model is loaded.
        if (use_mocked) {
        const std::string msg =
            "Sampling parameters are ignored when using --mocked";
        if (logger) {
          logger->Log(LogLevel::Warn, PipelinePhase::Startup, msg);
        } else {
          std::cerr << msg << std::endl;
        }
      } else {
        SamplingOptions sampling;
        sampling.temperature = var_map["temperature"].as<float>();
        sampling.top_p = var_map["top-p"].as<float>();
        sampling.top_k = var_map["top-k"].as<uint32_t>();
        sampling.n_ctx = var_map["n-ctx"].as<uint32_t>();
        sampling.seed = var_map["seed"].as<int>();
        sampling.n_gpu_layers = var_map["n-gpu-layers"].as<int>();

        options.generator.sampling = sampling;
      }
    }

    return options;

  } catch (const std::exception& exception) {
    const std::string msg =
        std::string("Failed to parse command-line arguments: ") +
        exception.what();
    if (logger) {
      logger->Log(LogLevel::Error, PipelinePhase::Startup, msg);
    } else {
      std::cerr << msg << std::endl;
    }
    return std::nullopt;
  } catch (...) {
    const std::string msg = "Failed to parse command-line arguments: unknown error";
    if (logger) {
      logger->Log(LogLevel::Error, PipelinePhase::Startup, msg);
    } else {
      std::cerr << msg << std::endl;
    }
    return std::nullopt;
  }
}
