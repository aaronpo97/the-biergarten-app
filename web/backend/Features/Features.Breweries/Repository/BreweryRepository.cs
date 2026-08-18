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
///     The two read methods below therefore read rows manually via <see cref="DbDataReader.GetFieldValue{T}" />
///     (the same approach the previous ADO.NET implementation used, which SqlClient supports specifically
///     for UDT columns). All write methods use Dapper, since they only bind parameters and never
///     deserialize <c>Coordinates</c> back out of a result set.
/// </remarks>
public class BreweryRepository(ISqlConnectionFactory connectionFactory)
    : Repository<BreweryPost>(connectionFactory),
        IBreweryRepository
{
    private const string SelectColumns =
        "bp.BreweryPostID, bp.PostedByID, bp.BreweryName, bp.Description, bp.CreatedAt, bp.UpdatedAt, bp.Timer, "
        + "bpl.BreweryPostLocationID, bpl.CityID, bpl.AddressLine1, bpl.AddressLine2, bpl.PostalCode, bpl.Coordinates";

    /// <inheritdoc/>
    /// <remarks>
    ///     Joins to the location table with an <c>INNER JOIN</c> (matching the previous stored procedure's
    ///     behavior), which is why a brewery with no location row is treated as not found.
    /// </remarks>
    public async Task<BreweryPost?> GetByIdAsync(Guid id)
    {
        await using DbConnection connection = await CreateConnection();
        await using DbCommand command = connection.CreateCommand();
        command.CommandText =
            $"""
            SELECT {SelectColumns}
            FROM dbo.BreweryPost bp
            INNER JOIN dbo.BreweryPostLocation bpl ON bp.BreweryPostID = bpl.BreweryPostID
            WHERE bp.BreweryPostID = @BreweryPostId
            """;
        AddParameter(command, "@BreweryPostId", id);

        await using DbDataReader reader = await command.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapToEntity(reader) : null;
    }

    /// <inheritdoc/>
    public async Task<IEnumerable<BreweryPost>> GetAllAsync(int? limit, int? offset)
    {
        await using DbConnection connection = await CreateConnection();
        await using DbCommand command = connection.CreateCommand();
        command.CommandText =
            $"""
            SELECT {SelectColumns}
            FROM dbo.BreweryPost bp
            LEFT JOIN dbo.BreweryPostLocation bpl ON bp.BreweryPostID = bpl.BreweryPostID
            ORDER BY bp.CreatedAt DESC
            OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
            """;
        AddParameter(command, "@Offset", offset ?? 0);
        AddParameter(command, "@Limit", limit ?? int.MaxValue);

        await using DbDataReader reader = await command.ExecuteReaderAsync();
        List<BreweryPost> breweries = [];

        while (await reader.ReadAsync())
            breweries.Add(MapToEntity(reader));

        return breweries;
    }

    /// <inheritdoc/>
    public async Task<BreweryPost> UpdateAsync(BreweryPost brewery)
    {
        await using DbConnection connection = await CreateConnection();
        await using DbTransaction transaction = await connection.BeginTransactionAsync();

        try
        {
            bool breweryExists =
                await connection.ExecuteScalarAsync<int?>(
                    new CommandDefinition(
                        "SELECT 1 FROM dbo.BreweryPost WHERE BreweryPostID = @BreweryPostId",
                        new { brewery.BreweryPostId },
                        transaction
                    )
                ) is not null;

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
                    ) is not null;

                if (!cityExists)
                    throw new NotFoundException("City not found.");
            }

            int updatedRows = await connection.ExecuteAsync(
                new CommandDefinition(
                    """
                    UPDATE dbo.BreweryPost
                    SET BreweryName = @BreweryName, Description = @Description, UpdatedAt = GETDATE()
                    WHERE BreweryPostID = @BreweryPostId AND Timer = @Timer
                    """,
                    new
                    {
                        brewery.BreweryPostId,
                        brewery.BreweryName,
                        brewery.Description,
                        brewery.Timer,
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
                        "DELETE FROM dbo.BreweryPostLocation WHERE BreweryPostID = @BreweryPostId",
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
                            "SELECT 1 FROM dbo.BreweryPostLocation WHERE BreweryPostID = @BreweryPostId",
                            new { brewery.BreweryPostId },
                            transaction
                        )
                    ) is not null;

                if (locationExists)
                    await connection.ExecuteAsync(
                        new CommandDefinition(
                            """
                            UPDATE dbo.BreweryPostLocation
                            SET CityID = @CityId, AddressLine1 = @AddressLine1, AddressLine2 = @AddressLine2,
                                PostalCode = @PostalCode, Coordinates = @Coordinates
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
                                (BreweryPostLocationID, BreweryPostID, CityID, AddressLine1, AddressLine2, PostalCode, Coordinates)
                            VALUES (@BreweryPostLocationId, @BreweryPostId, @CityId, @AddressLine1, @AddressLine2, @PostalCode, @Coordinates)
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
            await transaction.RollbackAsync();
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
            "DELETE FROM dbo.BreweryPost WHERE BreweryPostID = @BreweryPostId",
            new { BreweryPostId = id }
        );

        if (rows == 0)
            throw new NotFoundException("Brewery not found.");
    }

    /// <inheritdoc/>
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
                        "SELECT 1 FROM dbo.UserAccount WHERE UserAccountID = @PostedById",
                        new { brewery.PostedById },
                        transaction
                    )
                ) is not null;

            if (!userExists)
                throw new NotFoundException("User not found.");

            bool cityExists =
                await connection.ExecuteScalarAsync<int?>(
                    new CommandDefinition(
                        "SELECT 1 FROM dbo.City WHERE CityID = @CityId",
                        new { brewery.Location.CityId },
                        transaction
                    )
                ) is not null;

            if (!cityExists)
                throw new NotFoundException("City not found.");

            await connection.ExecuteAsync(
                new CommandDefinition(
                    "INSERT INTO dbo.BreweryPost (BreweryPostID, BreweryName, Description, PostedByID) VALUES (@BreweryPostId, @BreweryName, @Description, @PostedById)",
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
                        (BreweryPostLocationID, BreweryPostID, CityID, AddressLine1, AddressLine2, PostalCode, Coordinates)
                    VALUES (@BreweryPostLocationId, @BreweryPostId, @CityId, @AddressLine1, @AddressLine2, @PostalCode, @Coordinates)
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
            await transaction.RollbackAsync();
            throw;
        }
    }

    /// <summary>
    ///     Maps the current row of <paramref name="reader" /> to a <see cref="BreweryPost" />, including its
    ///     associated <see cref="BreweryPostLocation" /> if a location row was joined in.
    /// </summary>
    private static BreweryPost MapToEntity(DbDataReader reader)
    {
        int ordBreweryPostId = reader.GetOrdinal("BreweryPostId");
        int ordPostedById = reader.GetOrdinal("PostedById");
        int ordBreweryName = reader.GetOrdinal("BreweryName");
        int ordDescription = reader.GetOrdinal("Description");
        int ordCreatedAt = reader.GetOrdinal("CreatedAt");
        int ordUpdatedAt = reader.GetOrdinal("UpdatedAt");
        int ordTimer = reader.GetOrdinal("Timer");

        BreweryPost brewery = new()
        {
            BreweryPostId = reader.GetGuid(ordBreweryPostId),
            PostedById = reader.GetGuid(ordPostedById),
            BreweryName = reader.GetString(ordBreweryName),
            Description = reader.GetString(ordDescription),
            CreatedAt = reader.GetDateTime(ordCreatedAt),
            UpdatedAt = reader.IsDBNull(ordUpdatedAt) ? null : reader.GetDateTime(ordUpdatedAt),
            Timer = reader.IsDBNull(ordTimer) ? null : reader.GetFieldValue<byte[]>(ordTimer),
        };

        int ordLocationId = reader.GetOrdinal("BreweryPostLocationId");
        if (!reader.IsDBNull(ordLocationId))
        {
            int ordCoordinates = reader.GetOrdinal("Coordinates");
            int ordAddressLine2 = reader.GetOrdinal("AddressLine2");

            brewery.Location = new BreweryPostLocation
            {
                BreweryPostLocationId = reader.GetGuid(ordLocationId),
                BreweryPostId = brewery.BreweryPostId,
                CityId = reader.GetGuid(reader.GetOrdinal("CityId")),
                AddressLine1 = reader.GetString(reader.GetOrdinal("AddressLine1")),
                AddressLine2 = reader.IsDBNull(ordAddressLine2)
                    ? null
                    : reader.GetString(ordAddressLine2),
                PostalCode = reader.GetString(reader.GetOrdinal("PostalCode")),
                Coordinates = reader.IsDBNull(ordCoordinates)
                    ? null
                    : reader.GetFieldValue<byte[]>(ordCoordinates),
            };
        }

        return brewery;
    }

    private static void AddParameter(DbCommand command, string name, object? value)
    {
        DbParameter p = command.CreateParameter();
        p.ParameterName = name;
        p.Value = value ?? DBNull.Value;
        command.Parameters.Add(p);
    }
}
