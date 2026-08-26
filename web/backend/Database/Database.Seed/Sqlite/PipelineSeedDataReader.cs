using System.Text.Json;
using Database.Seed.PipelineData;
using Microsoft.Data.Sqlite;

namespace Database.Seed.Sqlite;

public sealed record SeedData(
    IReadOnlyList<BreweryRecord> Breweries,
    IReadOnlyList<UserRecord> Users
);

public sealed class PipelineSeedDataReader
{
    private readonly string _connectionString;

    public PipelineSeedDataReader(string connectionString)
    {
        _connectionString = connectionString;
    }

    /// <summary>
    /// Reads breweries and users in a single connection, loading the cities
    /// lookup only once and sharing it between both reads.
    /// </summary>
    public async Task<SeedData> ReadSeedDataAsync(CancellationToken cancellationToken = default)
    {
        await using SqliteConnection connection = new(_connectionString);
        await connection.OpenAsync(cancellationToken);

        IReadOnlyDictionary<long, City> cities = await ReadCitiesAsync(
            connection,
            cancellationToken
        );

        IReadOnlyList<BreweryRecord> breweries = await ReadBreweryRecordsAsync(
            connection,
            cities,
            cancellationToken
        );
        IReadOnlyList<UserRecord> users = await ReadUserRecordsAsync(
            connection,
            cities,
            cancellationToken
        );

        return new SeedData(breweries, users);
    }

    private static async Task<IReadOnlyList<BreweryRecord>> ReadBreweryRecordsAsync(
        SqliteConnection connection,
        IReadOnlyDictionary<long, City> cities,
        CancellationToken cancellationToken
    )
    {
        const string sql = """
            SELECT b.name_en, b.description_en, b.name_local, b.description_local,
                   ba.city_id, ba.longitude, ba.latitude, ba.address_line1, ba.postal_code
            FROM breweries b
            JOIN brewery_addresses ba ON ba.brewery_id = b.id;
            """;

        await using SqliteCommand command = new(sql, connection);
        await using SqliteDataReader reader = await command.ExecuteReaderAsync(cancellationToken);

        const int nameEnIndex = 0;
        const int descriptionEnIndex = 1;
        const int nameLocalIndex = 2;
        const int descriptionLocalIndex = 3;
        const int cityIdIndex = 4;
        const int longitudeIndex = 5;
        const int latitudeIndex = 6;
        const int addressLine1Index = 7;
        const int postalCodeIndex = 8;

        List<BreweryRecord> records = [];
        while (await reader.ReadAsync(cancellationToken))
            records.Add(
                new BreweryRecord
                {
                    Brewery = new BreweryResult
                    {
                        NameEn = reader.GetString(nameEnIndex),
                        DescriptionEn = reader.GetString(descriptionEnIndex),
                        NameLocal = reader.GetString(nameLocalIndex),
                        DescriptionLocal = reader.GetString(descriptionLocalIndex),
                    },
                    Address = new BreweryAddress
                    {
                        City = cities[reader.GetInt64(cityIdIndex)],
                        Longitude = reader.GetDouble(longitudeIndex),
                        Latitude = reader.GetDouble(latitudeIndex),
                        AddressLine1 = reader.GetString(addressLine1Index),
                        PostalCode = reader.GetString(postalCodeIndex),
                    },
                }
            );

        return records;
    }

    private static async Task<IReadOnlyList<UserRecord>> ReadUserRecordsAsync(
        SqliteConnection connection,
        IReadOnlyDictionary<long, City> cities,
        CancellationToken cancellationToken
    )
    {
        const string sql = """
            SELECT u.first_name, u.last_name, u.gender, u.username, u.bio,
                   u.activity_weight, u.email, u.date_of_birth,
                   ua.city_id, ua.longitude, ua.latitude
            FROM users u
            JOIN user_addresses ua ON ua.user_id = u.id;
            """;

        await using SqliteCommand command = new(sql, connection);
        await using SqliteDataReader reader = await command.ExecuteReaderAsync(cancellationToken);

        const int firstNameIndex = 0;
        const int lastNameIndex = 1;
        const int genderIndex = 2;
        const int usernameIndex = 3;
        const int bioIndex = 4;
        const int activityWeightIndex = 5;
        const int emailIndex = 6;
        const int dateOfBirthIndex = 7;
        const int cityIdIndex = 8;
        const int longitudeIndex = 9;
        const int latitudeIndex = 10;

        List<UserRecord> records = [];
        while (await reader.ReadAsync(cancellationToken))
            records.Add(
                new UserRecord
                {
                    User = new UserResult
                    {
                        FirstName = reader.GetString(firstNameIndex),
                        LastName = reader.GetString(lastNameIndex),
                        Gender = reader.GetString(genderIndex),
                        Username = reader.GetString(usernameIndex),
                        Bio = reader.GetString(bioIndex),
                        ActivityWeight = (float)reader.GetDouble(activityWeightIndex),
                    },
                    Email = reader.GetString(emailIndex),
                    DateOfBirth = reader.GetString(dateOfBirthIndex),
                    Address = new UserAddress
                    {
                        City = cities[reader.GetInt64(cityIdIndex)],
                        Longitude = reader.GetDouble(longitudeIndex),
                        Latitude = reader.GetDouble(latitudeIndex),
                    },
                }
            );

        return records;
    }

    private static async Task<IReadOnlyDictionary<long, City>> ReadCitiesAsync(
        SqliteConnection connection,
        CancellationToken cancellationToken
    )
    {
        const string sql = """
            SELECT
                 id,
                 city,
                 state_province,
                 iso3166_2,
                 country,
                 iso3166_1,
                 local_languages_json,
                 postal_code_country_format_regex,
                 postal_code_city_regex_json
            FROM cities;
            """;

        await using SqliteCommand command = new(sql, connection);
        await using SqliteDataReader reader = await command.ExecuteReaderAsync(cancellationToken);

        Dictionary<long, City> cities = [];

        const int idIndex = 0;
        const int cityNameIndex = 1;
        const int stateProvinceIndex = 2;
        const int iso31662Index = 3;
        const int countryIndex = 4;
        const int iso31661Index = 5;
        const int localLanguagesIndex = 6;
        const int countryFormatRegexIndex = 7;
        const int cityRegexesIndex = 8;

        while (await reader.ReadAsync(cancellationToken))
            cities[reader.GetInt64(idIndex)] = new City
            {
                CityName = reader.GetString(cityNameIndex),
                StateProvince = reader.GetString(stateProvinceIndex),
                Iso31662 = reader.GetString(iso31662Index),
                Country = reader.GetString(countryIndex),
                Iso31661 = reader.GetString(iso31661Index),
                LocalLanguages = DeserializeStringArray(reader.GetString(localLanguagesIndex)),
                PostalCode = new PostalCodeSpec
                {
                    CountryFormatRegex = reader.GetString(countryFormatRegexIndex),
                    CityRegexes = DeserializeStringArray(reader.GetString(cityRegexesIndex)),
                },
            };

        return cities;
    }

    private static IReadOnlyList<string> DeserializeStringArray(string json)
    {
        return JsonSerializer.Deserialize<List<string>>(json) ?? [];
    }
}
