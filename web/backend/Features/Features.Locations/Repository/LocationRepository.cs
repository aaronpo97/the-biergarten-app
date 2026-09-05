using System.Data.Common;
using Dapper;
using Database.Connection;
using Features.Locations.Dtos;

namespace Features.Locations.Repository;

public class LocationRepository(ISqlConnectionFactory connectionFactory)
    : DapperRepository(connectionFactory),
        ILocationRepository
{
    private const string CityDtoSelect = """
        SELECT
            c.CityID AS CityId,
            c.CityName,
            sp.StateProvinceName,
            sp.ISO3166_2 AS StateProvinceCode,
            co.CountryName,
            co.ISO3166_1 AS CountryCode,
            COUNT(bpl.BreweryPostLocationID) AS BreweryCount
        FROM Geolocation.City c
        INNER JOIN Geolocation.StateProvince sp ON sp.StateProvinceID = c.StateProvinceID
        INNER JOIN Geolocation.Country co ON co.CountryID = sp.CountryID
        LEFT JOIN Brewery.BreweryPostLocation bpl ON bpl.CityID = c.CityID
        """;

    private const string CityDtoGroupBy = """
        GROUP BY c.CityID, c.CityName, sp.StateProvinceName, sp.ISO3166_2, co.CountryName, co.ISO3166_1
        """;

    public async Task<CityDto?> GetCityByIdAsync(Guid cityId)
    {
        await using DbConnection connection = await CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<CityDto>(
            $"""
            {CityDtoSelect}
            WHERE c.CityID = @CityId
            {CityDtoGroupBy}
            """,
            new { CityId = cityId }
        );
    }

    public async Task<IEnumerable<CityDto>> GetAllCitiesAsync(int? limit, int? offset)
    {
        await using DbConnection connection = await CreateConnection();
        return await connection.QueryAsync<CityDto>(
            $"""
            {CityDtoSelect}
            {CityDtoGroupBy}
            ORDER BY c.CityName
            OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
            """,
            new { Offset = offset ?? 0, Limit = limit ?? int.MaxValue }
        );
    }

    public async Task<Guid?> GetCountryIdAsync(string isoCode)
    {
        await using DbConnection connection = await CreateConnection();
        return await connection.ExecuteScalarAsync<Guid?>(
            """
            SELECT CountryID
            FROM Geolocation.Country
            WHERE ISO3166_1 = @ISO3166_1
            """,
            new { ISO3166_1 = isoCode }
        );
    }

    public async Task<Guid> CreateCountryAsync(string countryName, string isoCode)
    {
        await using DbConnection connection = await CreateConnection();
        return await connection.ExecuteScalarAsync<Guid>(
            """
            INSERT INTO Geolocation.Country (CountryName, ISO3166_1)
            OUTPUT INSERTED.CountryID
            VALUES (@CountryName, @ISO3166_1)
            """,
            new { CountryName = countryName, ISO3166_1 = isoCode }
        );
    }

    public async Task<Guid?> GetStateProvinceIdAsync(string isoCode)
    {
        await using DbConnection connection = await CreateConnection();
        return await connection.ExecuteScalarAsync<Guid?>(
            """
            SELECT StateProvinceID
            FROM Geolocation.StateProvince
            WHERE ISO3166_2 = @ISO3166_2
            """,
            new { ISO3166_2 = isoCode }
        );
    }

    public async Task<Guid> CreateStateProvinceAsync(
        string stateProvinceName,
        string isoCode,
        Guid countryId
    )
    {
        await using DbConnection connection = await CreateConnection();
        return await connection.ExecuteScalarAsync<Guid>(
            """
            INSERT INTO Geolocation.StateProvince (StateProvinceName, ISO3166_2, CountryID)
            OUTPUT INSERTED.StateProvinceID
            VALUES (@StateProvinceName, @ISO3166_2, @CountryId)
            """,
            new
            {
                StateProvinceName = stateProvinceName,
                ISO3166_2 = isoCode,
                CountryId = countryId,
            }
        );
    }

    public async Task<Guid?> GetCityIdAsync(string cityName, string stateProvinceIsoCode)
    {
        await using DbConnection connection = await CreateConnection();
        return await connection.ExecuteScalarAsync<Guid?>(
            """
            SELECT c.CityID
            FROM Geolocation.City c
            INNER JOIN Geolocation.StateProvince sp ON sp.StateProvinceID = c.StateProvinceID
            WHERE c.CityName = @CityName AND sp.ISO3166_2 = @StateProvinceCode
            """,
            new { CityName = cityName, StateProvinceCode = stateProvinceIsoCode }
        );
    }

    public async Task<Guid> CreateCityAsync(string cityName, Guid stateProvinceId)
    {
        await using DbConnection connection = await CreateConnection();
        return await connection.ExecuteScalarAsync<Guid>(
            """
            INSERT INTO Geolocation.City (StateProvinceID, CityName)
            OUTPUT INSERTED.CityID
            VALUES (@StateProvinceId, @CityName)
            """,
            new { StateProvinceId = stateProvinceId, CityName = cityName }
        );
    }
}
