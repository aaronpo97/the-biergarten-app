using System.Data.Common;
using Dapper;
using Database.Connection;
using Domain.Entities;
using Domain.Exceptions;

namespace Features.Breweries.Repository;

/// <summary>
///     Implements brewery persistence with Dapper.
/// </summary>
/// <remarks>
///     Coordinate queries convert SQL Server <c>GEOGRAPHY</c> values to <c>varbinary(max)</c>
///     so Dapper can deserialize them as binary coordinate data.
/// </remarks>
public class BreweryRepository(ISqlConnectionFactory connectionFactory)
    : DapperRepository(connectionFactory),
        IBreweryRepository
{
    private const int GeographySrid = 4326;

    static BreweryRepository()
    {
        SqlMapper.AddTypeHandler(new CoordinateDataTypeHandler());
    }

    /// <summary>Gets a brewery post with its location data.</summary>
    public async Task<BreweryPost?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
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
            new CommandDefinition(
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
                FROM Brewery.BreweryPost bp
                LEFT JOIN Brewery.BreweryPostLocation bpl ON bp.BreweryPostID = bpl.BreweryPostID
                LEFT JOIN Geolocation.City c ON bpl.CityID = c.CityID
                LEFT JOIN Geolocation.StateProvince sp ON c.StateProvinceID = sp.StateProvinceID
                LEFT JOIN Geolocation.Country co ON sp.CountryID = co.CountryID
                WHERE bp.BreweryPostID = @BreweryPostId
                """,
                new { BreweryPostId = id },
                cancellationToken: cancellationToken
            ),
            MapBreweryRow,
            "BreweryPostLocationID,CityID,StateProvinceID,CountryID"
        );

        return results.SingleOrDefault();
    }

    /// <summary>Gets the identifier of the user who created a brewery post.</summary>
    public async Task<Guid?> GetPostedByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default
    )
    {
        await using DbConnection connection = await CreateConnection();
        return await connection.ExecuteScalarAsync<Guid?>(
            new CommandDefinition(
                "SELECT PostedByID FROM Brewery.BreweryPost WHERE BreweryPostID = @BreweryPostId",
                new { BreweryPostId = id },
                cancellationToken: cancellationToken
            )
        );
    }

    /// <summary>Gets brewery posts in reverse chronological order.</summary>
    public async Task<IEnumerable<BreweryPost>> GetAllAsync(int? limit, int? offset)
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
            FROM Brewery.BreweryPost bp
            LEFT JOIN Brewery.BreweryPostLocation bpl ON bp.BreweryPostID = bpl.BreweryPostID
            LEFT JOIN Geolocation.City c ON bpl.CityID = c.CityID
            LEFT JOIN Geolocation.StateProvince sp ON c.StateProvinceID = sp.StateProvinceID
            LEFT JOIN Geolocation.Country co ON sp.CountryID = co.CountryID
            ORDER BY bp.CreatedAt DESC
            OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
            """,
            MapBreweryRow,
            new { Offset = offset ?? 0, Limit = limit ?? int.MaxValue },
            splitOn: "BreweryPostLocationID,CityID,StateProvinceID,CountryID"
        );
    }

    /// <summary>Gets brewery posts within the requested distance from an origin.</summary>
    public async Task<IEnumerable<BreweryPost>> GetAllLocationsWithinRange(
        CoordinateData coords,
        double rangeInMetres
    )
    {
        await using DbConnection connection = await CreateConnection();
        return await connection.QueryAsync<
            BreweryPost,
            BreweryPostLocation,
            City,
            StateProvince,
            Country,
            DistanceRow,
            BreweryPost
        >(
            """
            DECLARE @Origin geography = geography::Point(@Latitude, @Longitude, 4326);

            SELECT
                bp.BreweryPostID,
                bp.BreweryName,
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
                co.ISO3166_1 AS Iso31661,
                bpl.Coordinates.STDistance(@Origin) AS DistanceMetres
            FROM Brewery.BreweryPost bp
            INNER JOIN Brewery.BreweryPostLocation bpl ON bp.BreweryPostID = bpl.BreweryPostID
            LEFT JOIN Geolocation.City c ON bpl.CityID = c.CityID
            LEFT JOIN Geolocation.StateProvince sp ON c.StateProvinceID = sp.StateProvinceID
            LEFT JOIN Geolocation.Country co ON sp.CountryID = co.CountryID
            WHERE bpl.Coordinates IS NOT NULL
              AND bpl.Coordinates.STDistance(@Origin) <= @RangeInMetres
            ORDER BY bpl.Coordinates.STDistance(@Origin) ASC
            """,
            (post, location, city, stateProvince, country, distance) =>
                MapBreweryRowWithDistance(
                    post,
                    location,
                    city,
                    stateProvince,
                    country,
                    distance,
                    coords
                ),
            new
            {
                coords.Latitude,
                coords.Longitude,
                RangeInMetres = rangeInMetres,
            },
            splitOn: "BreweryPostLocationID,CityID,StateProvinceID,CountryID,DistanceMetres"
        );
    }

    /// <summary>Gets brewery posts that have location data.</summary>
    public async Task<IEnumerable<BreweryPost>> GetAllLocations()
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
                bp.BreweryName,
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
            FROM Brewery.BreweryPost bp
            INNER JOIN Brewery.BreweryPostLocation bpl ON bp.BreweryPostID = bpl.BreweryPostID
            LEFT JOIN Geolocation.City c ON bpl.CityID = c.CityID
            LEFT JOIN Geolocation.StateProvince sp ON c.StateProvinceID = sp.StateProvinceID
            LEFT JOIN Geolocation.Country co ON sp.CountryID = co.CountryID
            WHERE bpl.Coordinates IS NOT NULL
            ORDER BY bp.BreweryPostID ASC
            """,
            MapBreweryRow,
            splitOn: "BreweryPostLocationID,CityID,StateProvinceID,CountryID"
        );
    }

    /// <summary>Updates a brewery post and its location in a transaction.</summary>
    public async Task<BreweryPost> UpdateAsync(
        BreweryPost brewery,
        CancellationToken cancellationToken = default
    )
    {
        await using DbConnection connection = await CreateConnection();
        await using DbTransaction transaction = await connection.BeginTransactionAsync(
            cancellationToken
        );

        try
        {
            bool breweryExists =
                await connection.ExecuteScalarAsync<int?>(
                    new CommandDefinition(
                        """
                        SELECT 1 FROM
                            Brewery.BreweryPost
                        WHERE
                            BreweryPostID = @BreweryPostId
                        """,
                        new { brewery.BreweryPostId },
                        transaction,
                        cancellationToken: cancellationToken
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
                            "SELECT 1 FROM Geolocation.City WHERE CityID = @CityId",
                            new { brewery.Location.CityId },
                            transaction,
                            cancellationToken: cancellationToken
                        )
                    )
                    is not null;

                if (!cityExists)
                    throw new NotFoundException("City not found.");
            }

            int updatedRows = await connection.ExecuteAsync(
                new CommandDefinition(
                    """
                    UPDATE Brewery.BreweryPost
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
                    transaction,
                    cancellationToken: cancellationToken
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
                            Brewery.BreweryPostLocation
                        WHERE BreweryPostID = @BreweryPostId
                        """,
                        new { brewery.BreweryPostId },
                        transaction,
                        cancellationToken: cancellationToken
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
                            FROM Brewery.BreweryPostLocation
                            WHERE BreweryPostID = @BreweryPostId
                            """,
                            new { brewery.BreweryPostId },
                            transaction,
                            cancellationToken: cancellationToken
                        )
                    )
                    is not null;

                if (locationExists)
                    await connection.ExecuteAsync(
                        new CommandDefinition(
                            """
                            UPDATE Brewery.BreweryPostLocation
                            SET CityID = @CityId,
                                AddressLine1 = @AddressLine1,
                                AddressLine2 = @AddressLine2,
                                PostalCode = @PostalCode,
                                Coordinates = CASE
                                    WHEN @Latitude IS NULL THEN NULL
                                    ELSE geography::Point(@Latitude, @Longitude, @Srid)
                                END
                            WHERE BreweryPostID = @BreweryPostId
                            """,
                            new
                            {
                                brewery.BreweryPostId,
                                brewery.Location.CityId,
                                brewery.Location.AddressLine1,
                                brewery.Location.AddressLine2,
                                brewery.Location.PostalCode,
                                brewery.Location.Coordinates?.Latitude,
                                brewery.Location.Coordinates?.Longitude,
                                Srid = GeographySrid,
                            },
                            transaction,
                            cancellationToken: cancellationToken
                        )
                    );
                else
                    await connection.ExecuteAsync(
                        new CommandDefinition(
                            """
                            INSERT INTO Brewery.BreweryPostLocation
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
                                    CASE
                                        WHEN @Latitude IS NULL THEN NULL
                                        ELSE geography::Point(@Latitude, @Longitude, @Srid)
                                    END)
                            """,
                            new
                            {
                                brewery.Location.BreweryPostLocationId,
                                brewery.BreweryPostId,
                                brewery.Location.CityId,
                                brewery.Location.AddressLine1,
                                brewery.Location.AddressLine2,
                                brewery.Location.PostalCode,
                                brewery.Location.Coordinates?.Latitude,
                                brewery.Location.Coordinates?.Longitude,
                                Srid = GeographySrid,
                            },
                            transaction,
                            cancellationToken: cancellationToken
                        )
                    );
            }

            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await RollbackQuietlyAsync(transaction);
            throw;
        }

        return await GetByIdAsync(brewery.BreweryPostId, cancellationToken)
            ?? throw new InvalidOperationException(
                $"Brewery '{brewery.BreweryPostId}' was not found after a successful update."
            );
    }

    /// <summary>Deletes the brewery post identified by <paramref name="id" />.</summary>
    public async Task DeleteAsync(Guid id)
    {
        await using DbConnection connection = await CreateConnection();
        int rows = await connection.ExecuteAsync(
            """
            DELETE FROM
                Brewery.BreweryPost
            WHERE
                BreweryPostID = @BreweryPostId
            """,
            new { BreweryPostId = id }
        );

        if (rows == 0)
            throw new NotFoundException("Brewery not found.");
    }

    /// <summary>Creates a brewery post and its location in a transaction.</summary>
    public async Task CreateAsync(BreweryPost brewery)
    {
        if (brewery.Location is null)
            throw new ArgumentException("Location must be provided when creating a brewery.");

        await using DbConnection connection = await CreateConnection();
        await using DbTransaction transaction = await connection.BeginTransactionAsync();

        try
        {
            bool userExists =
                await connection.ExecuteScalarAsync<int?>(
                    new CommandDefinition(
                        """
                                    SELECT 1
                                    FROM
                                        Auth.UserAccount
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
                                        Geolocation.City
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
                    INSERT INTO Brewery.BreweryPost
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
                    INSERT INTO Brewery.BreweryPostLocation
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
                            CASE
                                WHEN @Latitude IS NULL THEN NULL
                                ELSE geography::Point(@Latitude, @Longitude, @Srid)
                            END)
                    """,
                    new
                    {
                        brewery.Location.BreweryPostLocationId,
                        brewery.BreweryPostId,
                        brewery.Location.CityId,
                        brewery.Location.AddressLine1,
                        brewery.Location.AddressLine2,
                        brewery.Location.PostalCode,
                        brewery.Location.Coordinates?.Latitude,
                        brewery.Location.Coordinates?.Longitude,
                        Srid = GeographySrid,
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
    ///     Reconstructs a brewery post and its optional location hierarchy from a joined row.
    /// </summary>
    private static BreweryPost MapBreweryRow(
        BreweryPost post,
        BreweryPostLocation? location,
        City? city,
        StateProvince? stateProvince,
        Country? country
    )
    {
        if (location is null)
            return post;

        // The schema guarantees that whenever a location row was joined in, its City/StateProvince/
        // Country chain was too, so these are never null alongside a non-null location.
        city!.StateProvinceId = stateProvince!.StateProvinceId;
        stateProvince.CountryId = country!.CountryId;
        stateProvince.Country = country;
        city.StateProvince = stateProvince;

        location.BreweryPostId = post.BreweryPostId;
        location.CityId = city.CityId;
        location.City = city;

        post.Location = location;
        return post;
    }

    /// <summary>
    ///     Reconstructs a brewery row and attaches its database-calculated distance.
    /// </summary>
    private static BreweryPost MapBreweryRowWithDistance(
        BreweryPost post,
        BreweryPostLocation location,
        City city,
        StateProvince stateProvince,
        Country country,
        DistanceRow distance,
        CoordinateData origin
    )
    {
        BreweryPost mapped = MapBreweryRow(post, location, city, stateProvince, country);
        mapped.Distance = new DistanceInformation(origin, distance.DistanceMetres);
        return mapped;
    }

    /// <summary>
    ///     Holds the distance calculated by a proximity query.
    /// </summary>
    private sealed class DistanceRow
    {
        public double DistanceMetres { get; set; }
    }
}
