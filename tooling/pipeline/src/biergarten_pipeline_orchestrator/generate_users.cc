/**
 * @file biergarten_pipeline_orchestrator/generate_users.cc
 * @brief BiergartenPipelineOrchestrator::GenerateUsers() implementation.
 */

#include <cctype>
#include <chrono>
#include <format>
#include <iterator>
#include <optional>
#include <random>
#include <stdexcept>
#include <string>
#include <string_view>
#include <unordered_map>
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
      out.push_back(static_cast<char>(
          std::tolower(static_cast<unsigned char>(character))));
    }
  }
  return out;
}

std::string BuildEmail(const Name& name,
                       std::unordered_set<std::string>& used_local_parts) {
  const std::string base =
      std::format("{}.{}", Sanitize(name.first_name), Sanitize(name.last_name));

  std::string local_part = base;
  uint32_t suffix = 1;

  while (used_local_parts.contains(local_part)) {
    local_part = std::format("{}{}", base, suffix);
    ++suffix;
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

  return std::format("{:04}-{:02}-{:02}", static_cast<int>(birth_ymd.year()),
                     static_cast<unsigned>(birth_ymd.month()),
                     static_cast<unsigned>(birth_ymd.day()));
}

std::optional<Name> SampleName(
    const std::unordered_map<std::string, forename_list>& forenames_by_country,
    const std::unordered_map<std::string, surname_list>& surnames_by_country,
    const std::string& iso3166_1, std::mt19937& rng) {
  const auto forenames_it = forenames_by_country.find(iso3166_1);
  const auto surnames_it = surnames_by_country.find(iso3166_1);

  if (forenames_it == forenames_by_country.end() ||
      surnames_it == surnames_by_country.end() ||
      forenames_it->second.empty() || surnames_it->second.empty()) {
    return std::nullopt;
  }

  const forename_list& forenames = forenames_it->second;
  const surname_list& surnames = surnames_it->second;

  std::uniform_int_distribution<size_t> forename_dist(0, forenames.size() - 1);
  std::uniform_int_distribution<size_t> surname_dist(0, surnames.size() - 1);

  auto forename_it = forenames.begin();
  std::advance(forename_it, forename_dist(rng));

  auto surname_it = surnames.begin();
  std::advance(surname_it, surname_dist(rng));

  return Name{.first_name = forename_it->name,
              .last_name = *surname_it,
              .gender = forename_it->gender};
}
}  // namespace

void BiergartenPipelineOrchestrator::GenerateUsers(
    std::span<const EnrichedCity> cities) {
  logger_->Log({.level = LogLevel::Info,
                .phase = PipelinePhase::UserGeneration,
                .message = "=== SAMPLE USER GENERATION ==="});

  const std::vector<UserPersona> personas =
      curated_data_service_->LoadPersonas("personas.json");

  if (personas.empty()) {
    throw std::runtime_error(
        "No personas available in personas.json for user generation");
  }

  const std::unordered_map<std::string, forename_list> forenames_by_country =
      curated_data_service_->LoadForenamesByCountry(
          "forenames-by-country.json");
  const std::unordered_map<std::string, surname_list> surnames_by_country =
      curated_data_service_->LoadSurnamesByCountry("surnames-by-country.json");

  std::mt19937 rng(std::random_device{}());
  std::uniform_int_distribution<size_t> persona_dist(0, personas.size() - 1);

  generated_users_.clear();
  size_t skipped_count = 0;
  size_t export_failed_count = 0;

  const auto generate_record =
      [this, &rng, &skipped_count](
          const EnrichedCity& city, const UserPersona& persona,
          const Name& sampled_name) -> std::optional<UserRecord> {
    try {
      std::unordered_set<std::string> used_email_local_parts;

      const UserResult user =
          generator_->GenerateUser(city, persona, sampled_name);

      return UserRecord{
          .location = city.location,
          .user = user,
          .email = BuildEmail(sampled_name, used_email_local_parts),
          .date_of_birth = GenerateDateOfBirth(rng),
      };
    } catch (const std::exception& e) {
      ++skipped_count;
      logger_->Log({.level = LogLevel::Warn,
                    .phase = PipelinePhase::UserGeneration,
                    .message = std::format(
                        "[Pipeline] Skipping city '{}' ({}): "
                        "user generation failed: {}",
                        city.location.city, city.location.country, e.what())});
      return std::nullopt;
    }
  };

  const auto export_record = [this,
                              &export_failed_count](const UserRecord& record) {
    try {
      exporter_->ProcessRecord(record);
    } catch (const std::exception& export_exception) {
      ++export_failed_count;

      logger_->Log(
          {.level = LogLevel::Warn,
           .phase = PipelinePhase::UserGeneration,
           .message = std::format("[Pipeline] Generated user for '{}' ({}) but "
                                  "SQLite export failed: {}",
                                  record.location.city, record.location.country,
                                  export_exception.what())});
    }
  };

  for (const auto& city : cities) {
    const std::optional<Name> sampled_name =
        SampleName(forenames_by_country, surnames_by_country,
                   city.location.iso3166_1, rng);

    if (!sampled_name.has_value()) {
      ++skipped_count;
      logger_->Log({.level = LogLevel::Warn,
                    .phase = PipelinePhase::UserGeneration,
                    .message = std::format(
                        "[Pipeline] Skipping city '{}' ({}): no names "
                        "available for country '{}'",
                        city.location.city, city.location.country,
                        city.location.iso3166_1)});
      continue;
    }

    const UserPersona& persona = personas[persona_dist(rng)];

    const std::optional<UserRecord> record =
        generate_record(city, persona, *sampled_name);
    if (!record.has_value()) {
      continue;
    }

    generated_users_.push_back(*record);
    export_record(*record);
  }

  if (skipped_count > 0) {
    logger_->Log(
        {.level = LogLevel::Warn,
         .phase = PipelinePhase::UserGeneration,
         .message = std::format(
             "[Pipeline] Skipped {} city/cities during user generation",
             skipped_count)});
  }

  if (export_failed_count > 0) {
    logger_->Log({.level = LogLevel::Warn,
                  .phase = PipelinePhase::Teardown,
                  .message = std::format("[Pipeline] Failed to export {} "
                                         "generated user/users to SQLite",
                                         export_failed_count)});
  }
}
