using System.Data.Common;
using Dapper;
using Domain.Entities;
using Domain.Exceptions;
using Features.Locations.Dtos;
using Infrastructure.Sql;

namespace Features.Locations.Repository;

/// <summary>
///     Dapper-based implementation of <see cref="ILocationRepository" />.
/// </summary>
public class LocationRepository(ISqlConnectionFactory connectionFactory)
    : Repository<City>(connectionFactory),
        ILocationRepository
{
    /// <inheritdoc />
    /// <remarks>
    ///     Not fully race-safe under concurrent callers for the same new city (neither was the stored
    ///     procedure this replaces, since <c>City</c> has no unique constraint on name+state): a
    ///     concurrent duplicate insert can succeed rather than being rejected. Country/StateProvince
    ///     creation guards against this the same way the original stored procedures did, via an
    ///     existence pre-check immediately before the insert.
    /// </remarks>
    public async Task<Guid> GetOrCreateCityIdAsync(CityLocation location)
    {
        await EnsureCountryExistsAsync(location.CountryName, location.CountryIsoCode);
        await EnsureStateProvinceExistsAsync(
            location.StateProvinceName,
            location.StateProvinceIsoCode,
            location.CountryIsoCode
        );

        Guid? cityId = await GetCityIdAsync(location.CityName, location.StateProvinceIsoCode);
        if (cityId is not null)
            return cityId.Value;

        Guid stateProvinceId =
            await GetStateProvinceIdAsync(location.StateProvinceIsoCode)
            ?? throw new NotFoundException(
                $"State/province '{location.StateProvinceIsoCode}' not found."
            );

        await using DbConnection connection = await CreateConnection();

        bool cityExists =
            await connection.ExecuteScalarAsync<int?>(
                """
                SELECT 1
                FROM dbo.City
                WHERE CityName = @CityName AND StateProvinceID = @StateProvinceId
                """,
                new { location.CityName, StateProvinceId = stateProvinceId }
            )
            is not null;

        if (!cityExists)
            await connection.ExecuteAsync(
                """
                INSERT INTO dbo.City (StateProvinceID, CityName)
                VALUES (@StateProvinceId, @CityName)
                """,
                new { StateProvinceId = stateProvinceId, location.CityName }
            );

        return await GetCityIdAsync(location.CityName, location.StateProvinceIsoCode)
            ?? throw new InvalidOperationException(
                $"City '{location.CityName}' was not found after creation."
            );
    }

    private async Task EnsureCountryExistsAsync(string countryName, string isoCode)
    {
        if (await GetCountryIdAsync(isoCode) is not null)
            return;

        await using DbConnection connection = await CreateConnection();

        bool exists =
            await connection.ExecuteScalarAsync<int?>(
                """
                SELECT 1
                FROM dbo.Country
                WHERE ISO3166_1 = @ISO3166_1
                """,
                new { ISO3166_1 = isoCode }
            )
            is not null;

        if (!exists)
            // A concurrent caller may create this country between the check above and here; that
            // race is tolerated (the resulting duplicate row, if any, is out of scope for this method).
            await connection.ExecuteAsync(
                """
                INSERT INTO dbo.Country (CountryName, ISO3166_1)
                VALUES (@CountryName, @ISO3166_1)
                """,
                new { CountryName = countryName, ISO3166_1 = isoCode }
            );
    }

    /// <summary>
    ///     Ensures a StateProvince row exists for <paramref name="isoCode" />.
    /// </summary>
    /// <exception cref="NotFoundException">
    ///     Thrown when no Country exists for <paramref name="countryIsoCode" />. Not expected in normal
    ///     operation, since callers ensure the Country exists first — retained as a defensive translation
    ///     in case of a race between concurrent callers.
    /// </exception>
    private async Task EnsureStateProvinceExistsAsync(
        string stateProvinceName,
        string isoCode,
        string countryIsoCode
    )
    {
        if (await GetStateProvinceIdAsync(isoCode) is not null)
            return;

        Guid countryId =
            await GetCountryIdAsync(countryIsoCode)
            ?? throw new NotFoundException($"Country '{countryIsoCode}' not found.");

        await using DbConnection connection = await CreateConnection();

        bool exists =
            await connection.ExecuteScalarAsync<int?>(
                """
                SELECT 1
                FROM dbo.StateProvince
                WHERE ISO3166_2 = @ISO3166_2
                """,
                new { ISO3166_2 = isoCode }
            )
            is not null;

        if (!exists)
            await connection.ExecuteAsync(
                """
                INSERT INTO dbo.StateProvince (StateProvinceName, ISO3166_2, CountryID)
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

    private async Task<Guid?> GetCountryIdAsync(string isoCode)
    {
        await using DbConnection connection = await CreateConnection();
        return await connection.ExecuteScalarAsync<Guid?>(
            """
            SELECT CountryID
            FROM dbo.Country
            WHERE ISO3166_1 = @ISO3166_1
            """,
            new { ISO3166_1 = isoCode }
        );
    }

    private async Task<Guid?> GetStateProvinceIdAsync(string isoCode)
    {
        await using DbConnection connection = await CreateConnection();
        return await connection.ExecuteScalarAsync<Guid?>(
            """
            SELECT StateProvinceID
            FROM dbo.StateProvince
            WHERE ISO3166_2 = @ISO3166_2
            """,
            new { ISO3166_2 = isoCode }
        );
    }

    private async Task<Guid?> GetCityIdAsync(string cityName, string stateProvinceIsoCode)
    {
        await using DbConnection connection = await CreateConnection();
        return await connection.ExecuteScalarAsync<Guid?>(
            """
            SELECT c.CityID
            FROM dbo.City c
            INNER JOIN dbo.StateProvince sp ON sp.StateProvinceID = c.StateProvinceID
            WHERE c.CityName = @CityName AND sp.ISO3166_2 = @StateProvinceCode
            """,
            new { CityName = cityName, StateProvinceCode = stateProvinceIsoCode }
        );
    }
}
