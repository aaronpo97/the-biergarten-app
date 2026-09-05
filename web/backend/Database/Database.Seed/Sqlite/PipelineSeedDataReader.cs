using System.Text.Json;

using Dapper;

using Database.Seed.SourceDataModels;

using Microsoft.Data.Sqlite;

namespace Database.Seed.Sqlite;

public sealed record SeedData(
    IReadOnlyList<City> Cities,
    IReadOnlyList<BreweryResult> Breweries,
    IReadOnlyList<UserRecord> Users
);

public sealed class SeedRepository : IDisposable
{
    private readonly SqliteConnection connection;
    public SeedRepository(string connectionString)
    {
        connection = new(connectionString);
    }

   public void Dispose()
   {
        connection.Dispose();
   }

    /// <summary>
    /// Reads breweries and users in a single connection, loading the cities
    /// lookup only once and sharing it between both reads.
    /// </summary>
    public async Task<SeedData> ReadSeedDataAsync(
        CancellationToken cancellationToken = default
    )
    {
        await connection.OpenAsync(cancellationToken);

        IReadOnlyDictionary<int, City> cities = await ReadCitiesAsync(
            connection,
            cancellationToken
        );

        IReadOnlyList<BreweryResult> breweries = await ReadBreweryRecordsAsync(
            connection,
            cities,
            cancellationToken
        );

        IReadOnlyList<UserRecord> users = await ReadUserRecordsAsync(
            connection,
            cities,
            cancellationToken
        );

        return new SeedData([.. cities.Values], breweries, users);
    }

    private sealed record BreweryRow(
        int Id,
        string NameEn,
        string DescriptionEn,
        string NameLocal,
        string DescriptionLocal,
        int AddressId,
        int CityId,
        double Longitude,
        double Latitude,
        string AddressLine1,
        string PostalCode
    );

    private static async Task<IReadOnlyList<BreweryResult>> ReadBreweryRecordsAsync(
        SqliteConnection connection,
        IReadOnlyDictionary<int, City> cities,
        CancellationToken cancellationToken
    )
    {
        const string sql = """
            SELECT
                b.id                 AS Id,
                b.name_en            AS NameEn,
                b.description_en     AS DescriptionEn,
                b.name_local         AS NameLocal,
                b.description_local  AS DescriptionLocal,
                ba.id                AS AddressId,
                ba.city_id           AS CityId,
                ba.longitude         AS Longitude,
                ba.latitude          AS Latitude,
                ba.address_line1     AS AddressLine1,
                ba.postal_code       AS PostalCode
            FROM
                breweries b
            INNER JOIN
                brewery_addresses ba ON ba.brewery_id = b.id;
            """;

        CommandDefinition command = new(sql, cancellationToken: cancellationToken);
        IEnumerable<BreweryRow> rows = await connection.QueryAsync<BreweryRow>(command);

        return [.. rows.Select(row => new BreweryResult
            {
                Id = row.Id,
                NameEn = row.NameEn,
                DescriptionEn = row.DescriptionEn,
                NameLocal = row.NameLocal,
                DescriptionLocal = row.DescriptionLocal,
                Address = new BreweryAddress
                {
                    Id = row.AddressId,
                    CityId = row.CityId,
                    BreweryId = row.Id,
                    Longitude = row.Longitude,
                    Latitude = row.Latitude,
                    AddressLine1 = row.AddressLine1,
                    PostalCode = row.PostalCode,
                    City = cities[row.CityId],
                },
            })];
    }

    private sealed record UserRow(
        int Id,
        string FirstName,
        string LastName,
        string Gender,
        string Username,
        string Bio,
        double ActivityWeight,
        string Email,
        string DateOfBirth,
        int AddressId,
        int CityId,
        double Longitude,
        double Latitude
    );

    private static async Task<IReadOnlyList<UserRecord>> ReadUserRecordsAsync(
        SqliteConnection connection,
        IReadOnlyDictionary<int, City> cities,
        CancellationToken cancellationToken
    )
    {
        const string sql = """
            SELECT
               u.id               AS Id,
               u.first_name       AS FirstName,
               u.last_name        AS LastName,
               u.gender           AS Gender,
               u.username         AS Username,
               u.bio              AS Bio,
               u.activity_weight  AS ActivityWeight,
               u.email            AS Email,
               u.date_of_birth    AS DateOfBirth,
               ua.id              AS AddressId,
               ua.city_id         AS CityId,
               ua.longitude       AS Longitude,
               ua.latitude        AS Latitude
            FROM
                users u
            INNER JOIN
                user_addresses ua ON ua.user_id = u.id;
            """;

        CommandDefinition command = new(sql, cancellationToken: cancellationToken);
        IEnumerable<UserRow> rows = await connection.QueryAsync<UserRow>(command);

        return [.. rows.Select(row => new UserRecord
            {
                Email = row.Email,
                DateOfBirth = row.DateOfBirth,
                Address = new UserAddress
                {
                    Id = row.AddressId,
                    CityId = row.CityId,
                    UserId = row.Id,
                    Longitude = row.Longitude,
                    Latitude = row.Latitude,
                    City = cities[row.CityId],
                },
                User = new UserResult
                {
                    Id = row.Id,
                    FirstName = row.FirstName,
                    LastName = row.LastName,
                    Gender = row.Gender,
                    Username = row.Username,
                    Bio = row.Bio,
                    ActivityWeight = (float)row.ActivityWeight,
                },
            })];
    }

    private sealed record CityRow(
        int Id,
        string CityName,
        string StateProvince,
        string Iso31662,
        string Country,
        string Iso31661,
        double Longitude,
        double Latitude,
        string LocalLanguagesJson,
        string PostalCodeCountryFormatRegex,
        string PostalCodeCityRegexesJson
    );

    private static async Task<IReadOnlyDictionary<int, City>> ReadCitiesAsync(
        SqliteConnection connection,
        CancellationToken cancellationToken
    )
    {
        const string sql = """
            SELECT
                 id                                 AS Id,
                 city                               AS CityName,
                 state_province                     AS StateProvince,
                 iso3166_2                          AS Iso31662,
                 country                            AS Country,
                 iso3166_1                          AS Iso31661,
                 longitude                          AS Longitude,
                 latitude                           AS Latitude,
                 local_languages_json               AS LocalLanguagesJson,
                 postal_code_country_format_regex   AS PostalCodeCountryFormatRegex,
                 postal_code_city_regex_json        AS PostalCodeCityRegexesJson
            FROM cities;
            """;

        CommandDefinition command = new(sql, cancellationToken: cancellationToken);
        IEnumerable<CityRow> rows = await connection.QueryAsync<CityRow>(command);

        return rows.ToDictionary(
            row => row.Id,
            row => new City
            {
                Id = row.Id,
                CityName = row.CityName,
                StateProvinceName = row.StateProvince,
                ISO_3166_2 = row.Iso31662,
                CountryName = row.Country,
                ISO_3166_1 = row.Iso31661,
                Longitude = row.Longitude,
                Latitude = row.Latitude,
                LocalLanguages = DeserializeStringArray(row.LocalLanguagesJson),
                PostalCode = new PostalCodeSpec(
                    CountryFormatRegex: row.PostalCodeCountryFormatRegex,
                    CityRegexes: DeserializeStringArray(row.PostalCodeCityRegexesJson)
                ),
            }
        );
    }

    private static IReadOnlyList<string> DeserializeStringArray(string json)
    {
        return JsonSerializer.Deserialize<List<string>>(json) ?? [];
    }

}
