using System.Text.Json;
using Database.Seed.PipelineData;
using Microsoft.Data.Sqlite;

namespace Database.Seed.Sqlite;

public sealed class PipelineSeedDataReader
{
    private readonly string _connectionString;

    public PipelineSeedDataReader(string connectionString)
    {
        _connectionString = connectionString;
    }

    public IReadOnlyList<BreweryRecord> ReadBreweryRecords()
    {
        using SqliteConnection connection = new(_connectionString);
        connection.Open();

        IReadOnlyDictionary<long, City> cities = ReadCities(connection);

        const string sql = """
                           SELECT b.name_en, b.description_en, b.name_local, b.description_local,
                                  ba.city_id, ba.postal_code
                           FROM breweries b
                           JOIN brewery_addresses ba ON ba.brewery_id = b.id;
                           """;

        using SqliteCommand command = new(sql, connection);
        using SqliteDataReader reader = command.ExecuteReader();

        List<BreweryRecord> records = [];
        while (reader.Read())
            records.Add(
                new BreweryRecord
                {
                    Brewery = new BreweryResult
                    {
                        NameEn = reader.GetString(0),
                        DescriptionEn = reader.GetString(1),
                        NameLocal = reader.GetString(2),
                        DescriptionLocal = reader.GetString(3)
                    },
                    Address = new BreweryAddress
                    {
                        City = cities[reader.GetInt64(4)],
                        PostalCode = reader.GetString(5)
                    }
                }
            );

        return records;
    }

    public IReadOnlyList<UserRecord> ReadUserRecords()
    {
        using SqliteConnection connection = new(_connectionString);
        connection.Open();

        IReadOnlyDictionary<long, City> cities = ReadCities(connection);

        const string sql = """
                           SELECT u.first_name, u.last_name, u.gender, u.username, u.bio,
                                  u.activity_weight, u.email, u.date_of_birth,
                                  ua.city_id, ua.postal_code
                           FROM users u
                           JOIN user_addresses ua ON ua.user_id = u.id;
                           """;

        using SqliteCommand command = new(sql, connection);
        using SqliteDataReader reader = command.ExecuteReader();

        List<UserRecord> records = [];
        while (reader.Read())
            records.Add(
                new UserRecord
                {
                    User = new UserResult
                    {
                        FirstName = reader.GetString(0),
                        LastName = reader.GetString(1),
                        Gender = reader.GetString(2),
                        Username = reader.GetString(3),
                        Bio = reader.GetString(4),
                        ActivityWeight = (float)reader.GetDouble(5)
                    },
                    Email = reader.GetString(6),
                    DateOfBirth = reader.GetString(7),
                    Address = new UserAddress
                    {
                        City = cities[reader.GetInt64(8)],
                        PostalCode = reader.GetString(9)
                    }
                }
            );

        return records;
    }

    private static IReadOnlyDictionary<long, City> ReadCities(SqliteConnection connection)
    {
        const string sql = """
                           SELECT id, city, state_province, iso3166_2, country, iso3166_1,
                                  local_languages_json, postal_code_country_format_regex,
                                  postal_code_city_regex_json
                           FROM cities;
                           """;

        using SqliteCommand command = new(sql, connection);
        using SqliteDataReader reader = command.ExecuteReader();

        Dictionary<long, City> cities = [];
        while (reader.Read())
            cities[reader.GetInt64(0)] = new City
            {
                CityName = reader.GetString(1),
                StateProvince = reader.GetString(2),
                Iso31662 = reader.GetString(3),
                Country = reader.GetString(4),
                Iso31661 = reader.GetString(5),
                LocalLanguages = DeserializeStringArray(reader.GetString(6)),
                PostalCode = new PostalCodeSpec
                {
                    CountryFormatRegex = reader.GetString(7),
                    CityRegexes = DeserializeStringArray(reader.GetString(8))
                }
            };

        return cities;
    }

    private static IReadOnlyList<string> DeserializeStringArray(string json)
    {
        return JsonSerializer.Deserialize<List<string>>(json) ?? [];
    }
}