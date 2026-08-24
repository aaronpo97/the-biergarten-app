using System.Data.Common;
using Dapper;
using Domain.Entities;
using Domain.Exceptions;
using Infrastructure.Sql;

namespace Features.Breweries.Repository;

/// <summary>
///     Dapper-based implementation of <see cref="IBreweryRepository" />.
/// </summary>
/// <remarks>
///     <c>BreweryPostLocation.Coordinates</c> is a SQL Server <c>GEOGRAPHY</c> column. Dapper's generic
///     <c>Query&lt;T&gt;</c> deserializer reads columns via <c>IDataRecord.GetValue</c>, which for a UDT
///     column returns a CLR UDT instance rather than raw bytes and cannot be coerced to <c>byte[]</c>.
///     The read queries below therefore select <c>CONVERT(varbinary(max), bpl.Coordinates)</c>, which
///     yields the UDT's serialized bytes as a plain <c>varbinary</c> value that Dapper can bind directly.
/// </remarks>
public class BreweryRepository(ISqlConnectionFactory connectionFactory)
    : Repository<BreweryPost>(connectionFactory),
        IBreweryRepository
{
    /// <inheritdoc/>
    public async Task<BreweryPost?> GetByIdAsync(Guid id)
    {
        await using DbConnection connection = await CreateConnection();
        IEnumerable<BreweryPost> results = await connection.QueryAsync<
            BreweryPost,
            BreweryPostLocation,
            City,
            StateProvince,
            Country,
            BreweryPost
        >(
            """
            SELECT
                bp.BreweryPostID,
                bp.PostedByID,
                bp.BreweryName,
                bp.Description,
                bp.CreatedAt,
                bp.UpdatedAt,
                bp.RowVersion,
                bpl.BreweryPostLocationID,
                bpl.AddressLine1,
                bpl.AddressLine2,
                bpl.PostalCode,
                CONVERT(varbinary(max), bpl.Coordinates) AS Coordinates,
                c.CityID,
                c.CityName,
                sp.StateProvinceID,
                sp.StateProvinceName,
                sp.ISO3166_2 AS Iso31662,
                co.CountryID,
                co.CountryName,
                co.ISO3166_1 AS Iso31661
            FROM dbo.BreweryPost bp
            LEFT JOIN dbo.BreweryPostLocation bpl ON bp.BreweryPostID = bpl.BreweryPostID
            LEFT JOIN dbo.City c ON bpl.CityID = c.CityID
            LEFT JOIN dbo.StateProvince sp ON c.StateProvinceID = sp.StateProvinceID
            LEFT JOIN dbo.Country co ON sp.CountryID = co.CountryID
            WHERE bp.BreweryPostID = @BreweryPostId
            """,
            MapBreweryRow,
            new { BreweryPostId = id },
            splitOn: "BreweryPostLocationID,CityID,StateProvinceID,CountryID"
        );

        return results.SingleOrDefault();
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<BreweryPost>> GetAllAsync(int? limit,
        int? offset)
    {
        await using DbConnection connection = await CreateConnection();
        return await connection.QueryAsync<
            BreweryPost,
            BreweryPostLocation,
            City,
            StateProvince,
            Country,
            BreweryPost
        >(
            """
            SELECT
                bp.BreweryPostID,
                bp.PostedByID,
                bp.BreweryName,
                bp.Description,
                bp.CreatedAt,
                bp.UpdatedAt,
                bp.RowVersion,
                bpl.BreweryPostLocationID,
                bpl.AddressLine1,
                bpl.AddressLine2,
                bpl.PostalCode,
                CONVERT(varbinary(max), bpl.Coordinates) AS Coordinates,
                c.CityID,
                c.CityName,
                sp.StateProvinceID,
                sp.StateProvinceName,
                sp.ISO3166_2 AS Iso31662,
                co.CountryID,
                co.CountryName,
                co.ISO3166_1 AS Iso31661
            FROM dbo.BreweryPost bp
            LEFT JOIN dbo.BreweryPostLocation bpl ON bp.BreweryPostID = bpl.BreweryPostID
            LEFT JOIN dbo.City c ON bpl.CityID = c.CityID
            LEFT JOIN dbo.StateProvince sp ON c.StateProvinceID = sp.StateProvinceID
            LEFT JOIN dbo.Country co ON sp.CountryID = co.CountryID
            ORDER BY bp.CreatedAt DESC
            OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
            """,
            MapBreweryRow,
            new { Offset = offset ?? 0, Limit = limit ?? int.MaxValue },
            splitOn: "BreweryPostLocationID,CityID,StateProvinceID,CountryID"
        );
    }

    /// <inheritdoc/>
    public async Task<BreweryPost> UpdateAsync(BreweryPost brewery)
    {
        await using DbConnection connection = await CreateConnection();
        await using DbTransaction transaction =
            await connection.BeginTransactionAsync();

        try
        {
            bool breweryExists =
                await connection.ExecuteScalarAsync<int?>(
                        new CommandDefinition(
                            """
                            SELECT 1 FROM
                                dbo.BreweryPost
                            WHERE
                                BreweryPostID = @BreweryPostId
                            """,
                            new { brewery.BreweryPostId },
                            transaction
                        )
                    )
                    is not null;

            if (!breweryExists)
                throw new NotFoundException("Brewery not found.");

            if (brewery.Location is not null)
            {
                bool cityExists =
                    await connection.ExecuteScalarAsync<int?>(
                            new CommandDefinition(
                                "SELECT 1 FROM dbo.City WHERE CityID = @CityId",
                                new { brewery.Location.CityId },
                                transaction
                            )
                        )
                        is not null;

                if (!cityExists)
                    throw new NotFoundException("City not found.");
            }

            int updatedRows = await connection.ExecuteAsync(
                new CommandDefinition(
                    """
                    UPDATE dbo.BreweryPost
                    SET BreweryName = @BreweryName,
                        Description = @Description,
                        UpdatedAt = GETDATE()
                    WHERE
                        BreweryPostID = @BreweryPostId
                      AND RowVersion = @RowVersion
                    """,
                    new
                    {
                        brewery.BreweryPostId,
                        brewery.BreweryName,
                        brewery.Description,
                        brewery.RowVersion,
                    },
                    transaction
                )
            );

            if (updatedRows == 0)
                throw new ConflictException(
                    "Brewery was modified by another request. Reload and try again."
                );

            if (brewery.Location is null)
            {
                // No location supplied: clear any existing location for this brewery.
                await connection.ExecuteAsync(
                    new CommandDefinition(
                        """
                        DELETE FROM
                            dbo.BreweryPostLocation
                        WHERE BreweryPostID = @BreweryPostId
                        """,
                        new { brewery.BreweryPostId },
                        transaction
                    )
                );
            }
            else
            {
                bool locationExists =
                    await connection.ExecuteScalarAsync<int?>(
                            new CommandDefinition(
                                """
                                SELECT 1
                                FROM dbo.BreweryPostLocation
                                WHERE BreweryPostID = @BreweryPostId
                                """,
                                new { brewery.BreweryPostId },
                                transaction
                            )
                        )
                        is not null;

                if (locationExists)
                    await connection.ExecuteAsync(
                        new CommandDefinition(
                            """
                            UPDATE dbo.BreweryPostLocation
                            SET CityID = @CityId,
                                AddressLine1 = @AddressLine1,
                                AddressLine2 = @AddressLine2,
                                PostalCode = @PostalCode,
                                Coordinates = @Coordinates
                            WHERE BreweryPostID = @BreweryPostId
                            """,
                            new
                            {
                                brewery.BreweryPostId,
                                brewery.Location.CityId,
                                brewery.Location.AddressLine1,
                                brewery.Location.AddressLine2,
                                brewery.Location.PostalCode,
                                brewery.Location.Coordinates,
                            },
                            transaction
                        )
                    );
                else
                    await connection.ExecuteAsync(
                        new CommandDefinition(
                            """
                            INSERT INTO dbo.BreweryPostLocation
                                (BreweryPostLocationID,
                                 BreweryPostID,
                                 CityID,
                                 AddressLine1,
                                 AddressLine2,
                                 PostalCode,
                                 Coordinates)
                            VALUES
                                   (@BreweryPostLocationId,
                                    @BreweryPostId,
                                    @CityId,
                                    @AddressLine1,
                                    @AddressLine2,
                                    @PostalCode,
                                    @Coordinates)
                            """,
                            new
                            {
                                brewery.Location.BreweryPostLocationId,
                                brewery.BreweryPostId,
                                brewery.Location.CityId,
                                brewery.Location.AddressLine1,
                                brewery.Location.AddressLine2,
                                brewery.Location.PostalCode,
                                brewery.Location.Coordinates,
                            },
                            transaction
                        )
                    );
            }

            await transaction.CommitAsync();
        }
        catch
        {
            await RollbackQuietlyAsync(transaction);
            throw;
        }

        return await GetByIdAsync(brewery.BreweryPostId)
               ?? throw new InvalidOperationException(
                   $"Brewery '{brewery.BreweryPostId}' was not found after a successful update."
               );
    }

    /// <inheritdoc/>
    public async Task DeleteAsync(Guid id)
    {
        await using DbConnection connection = await CreateConnection();
        int rows = await connection.ExecuteAsync(
            """
            DELETE FROM
                dbo.BreweryPost
            WHERE
                BreweryPostID = @BreweryPostId
            """,
            new { BreweryPostId = id }
        );

        if (rows == 0)
            throw new NotFoundException("Brewery not found.");
    }

    /// <inheritdoc/>
    public async Task CreateAsync(BreweryPost brewery)
    {
        if (brewery.Location is null)
            throw new ArgumentException(
                "Location must be provided when creating a brewery.");

        await using DbConnection connection = await CreateConnection();
        await using DbTransaction transaction =
            await connection.BeginTransactionAsync();

        try
        {
            bool userExists =
                await connection.ExecuteScalarAsync<int?>(
                        new CommandDefinition(
                            """
                                        SELECT 1
                                        FROM
                                            dbo.UserAccount
                                        WHERE
                                            UserAccountID = @PostedById
                            """,
                            new { brewery.PostedById },
                            transaction
                        )
                    )
                    is not null;

            if (!userExists)
                throw new NotFoundException("User not found.");

            bool cityExists =
                await connection.ExecuteScalarAsync<int?>(
                        new CommandDefinition(
                            """
                                        SELECT 1
                                        FROM
                                            dbo.City
                                        WHERE
                                            CityID = @CityId
                            """,
                            new { brewery.Location.CityId },
                            transaction
                        )
                    )
                    is not null;

            if (!cityExists)
                throw new NotFoundException("City not found.");

            await connection.ExecuteAsync(
                new CommandDefinition(
                    """
                    INSERT INTO dbo.BreweryPost
                        (BreweryPostID, BreweryName, Description, PostedByID)
                    VALUES
                        (@BreweryPostId, @BreweryName, @Description, @PostedById)
                    """,
                    new
                    {
                        brewery.BreweryPostId,
                        brewery.BreweryName,
                        brewery.Description,
                        brewery.PostedById,
                    },
                    transaction
                )
            );

            await connection.ExecuteAsync(
                new CommandDefinition(
                    """
                    INSERT INTO dbo.BreweryPostLocation
                        (BreweryPostLocationID,
                         BreweryPostID,
                         CityID,
                         AddressLine1,
                         AddressLine2,
                         PostalCode,
                         Coordinates)
                    VALUES (@BreweryPostLocationId,
                            @BreweryPostId,
                            @CityId,
                            @AddressLine1,
                            @AddressLine2,
                            @PostalCode,
                            @Coordinates)
                    """,
                    new
                    {
                        brewery.Location.BreweryPostLocationId,
                        brewery.BreweryPostId,
                        brewery.Location.CityId,
                        brewery.Location.AddressLine1,
                        brewery.Location.AddressLine2,
                        brewery.Location.PostalCode,
                        brewery.Location.Coordinates,
                    },
                    transaction
                )
            );

            await transaction.CommitAsync();
        }
        catch
        {
            await RollbackQuietlyAsync(transaction);
            throw;
        }
    }

    /// <summary>
    ///     Rolls back <paramref name="transaction" />, swallowing any exception the rollback itself
    ///     raises (for example when the provider has already completed the transaction after a
    ///     connection failure) so the exception that triggered the rollback is what propagates.
    /// </summary>
    private static async Task RollbackQuietlyAsync(DbTransaction transaction)
    {
        try
        {
            await transaction.RollbackAsync();
        }
        catch
        {
            // Ignore: the original exception (rethrown by the caller) is what matters here.
        }
    }

    /// <summary>
    ///     Composes a joined row's <see cref="BreweryPost" />, <see cref="BreweryPostLocation" />,
    ///     <see cref="City" />, <see cref="StateProvince" /> and <see cref="Country" /> fragments into a
    ///     single populated <see cref="BreweryPost" />. When the row has no location (a left-joined
    ///     brewery with no address on file), <paramref name="location" /> is a blank instance produced
    ///     from all-<c>NULL</c> columns; the schema guarantees that whenever a location row was joined
    ///     in, its City/StateProvince/Country chain was too.
    /// </summary>
    private static BreweryPost MapBreweryRow(
        BreweryPost post,
        BreweryPostLocation location,
        City city,
        StateProvince stateProvince,
        Country country
    )
    {
        if (location.BreweryPostLocationId == Guid.Empty)
            return post;

        stateProvince.CountryId = country.CountryId;
        stateProvince.Country = country;

        city.StateProvinceId = stateProvince.StateProvinceId;
        city.StateProvince = stateProvince;

        location.BreweryPostId = post.BreweryPostId;
        location.CityId = city.CityId;
        location.City = city;

        post.Location = location;
        return post;
    }
}
