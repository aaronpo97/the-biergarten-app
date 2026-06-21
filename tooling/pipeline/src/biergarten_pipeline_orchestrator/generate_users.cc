/**
 * @file biergarten_pipeline_orchestrator/generate_users.cc
 * @brief BiergartenDataGenerator::GenerateUsers() implementation.
 */

#include <cctype>
#include <chrono>
#include <format>
#include <optional>
#include <random>
#include <stdexcept>
#include <string>
#include <string_view>
#include <unordered_set>

#include "biergarten_pipeline_orchestrator.h"
#include "json_handling/json_loader.h"
#include "services/logging/logger.h"

namespace {

std::string Sanitize(std::string_view value) {
  std::string out;
  out.reserve(value.size());
  for (const char character : value) {
    if (std::isalnum(static_cast<unsigned char>(character)) != 0) {
      out.push_back(
          static_cast<char>(std::tolower(static_cast<unsigned char>(character))));
    }
  }
  return out;
}

std::string BuildEmail(const Name& name,
                       std::unordered_set<std::string>& used_local_parts) {
  const std::string base =
      std::format("{}.{}", Sanitize(name.first_name), Sanitize(name.last_name));

  std::string local_part = base;
  for (int suffix = 1; used_local_parts.contains(local_part); ++suffix) {
    local_part = std::format("{}{}", base, suffix);
  }
  used_local_parts.insert(local_part);

  return std::format("{}@thebiergarten.app", local_part);
}

std::string GenerateDateOfBirth(std::mt19937& rng) {
  using namespace std::chrono;

  constexpr int kMinAge = 19;
  constexpr int kMaxAge = 48;
  constexpr int kMaxDayOffset = 364;

  std::uniform_int_distribution<int> age_dist(kMinAge, kMaxAge);
  std::uniform_int_distribution<int> day_offset_dist(0, kMaxDayOffset);

  const year_month_day today{floor<days>(system_clock::now())};
  const year_month_day birth_year_anchor{today.year() - years{age_dist(rng)},
                                         today.month(), today.day()};
  const sys_days birth_date =
      sys_days{birth_year_anchor} - days{day_offset_dist(rng)};
  const year_month_day birth_ymd{birth_date};

  return std::format("{:04}-{:02}-{:02}",
                     static_cast<int>(birth_ymd.year()),
                     static_cast<unsigned>(birth_ymd.month()),
                     static_cast<unsigned>(birth_ymd.day()));
}

std::string GenerateRandomPassword(std::mt19937& rng) {
  constexpr size_t kPasswordLength = 32;
  constexpr std::string_view kCharset =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

  std::uniform_int_distribution<size_t> char_dist(0, kCharset.size() - 1);

  std::string password;
  password.reserve(kPasswordLength);
  for (size_t i = 0; i < kPasswordLength; ++i) {
    password.push_back(kCharset[char_dist(rng)]);
  }
  return password;
}

}  // namespace

void BiergartenPipelineOrchestrator::GenerateUsers(
    std::span<const EnrichedCity> cities) {
  logger_->Log({.level = LogLevel::Info,
                .phase = PipelinePhase::UserGeneration,
                .message = "=== SAMPLE USER GENERATION ==="});

  const std::vector<UserPersona> personas =
      JsonLoader::LoadPersonas("personas.json", logger_);
  if (personas.empty()) {
    throw std::runtime_error(
        "No personas available in personas.json for user generation");
  }

  const NamesByCountry names_by_country = JsonLoader::LoadNamesByCountry(
      "forenames-by-country.json", "surnames-by-country.json", logger_);

  std::mt19937 rng(std::random_device{}());
  std::uniform_int_distribution<size_t> persona_dist(0, personas.size() - 1);

  generated_users_.clear();
  std::unordered_set<std::string> used_email_local_parts;
  size_t skipped_count = 0;

  for (const auto& city : cities) {
    const std::optional<Name> sampled_name =
        names_by_country.SampleName(city.location.iso3166_1, rng);

    if (!sampled_name.has_value()) {
      ++skipped_count;
      logger_->Log(
          {.level = LogLevel::Warn,
           .phase = PipelinePhase::UserGeneration,
           .message = std::format(
               "[Pipeline] Skipping city '{}' ({}): no names available for "
               "country '{}'",
               city.location.city, city.location.country,
               city.location.iso3166_1)});
      continue;
    }

    const UserPersona& persona = personas[persona_dist(rng)];

    try {
      const UserResult user =
          generator_->GenerateUser(city, persona, *sampled_name);

      generated_users_.push_back(GeneratedUser{
          .location = city.location,
          .user = user,
          .email = BuildEmail(*sampled_name, used_email_local_parts),
          .date_of_birth = GenerateDateOfBirth(rng),
          .password = GenerateRandomPassword(rng),
      });
    } catch (const std::exception& e) {
      ++skipped_count;
      logger_->Log(
          {.level = LogLevel::Warn,
           .phase = PipelinePhase::UserGeneration,
           .message = std::format(
               "[Pipeline] Skipping city '{}' ({}): user generation failed: {}",
               city.location.city, city.location.country, e.what())});
    }
  }

  if (skipped_count > 0) {
    logger_->Log(
        {.level = LogLevel::Warn,
         .phase = PipelinePhase::UserGeneration,
         .message = std::format(
             "[Pipeline] Skipped {} city/cities during user generation",
             skipped_count)});
  }
}
