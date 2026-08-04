using System.Data;
using System.Data.Common;
using Domain.Entities;
using Infrastructure.Sql;

namespace Features.Breweries.Repository;

/// <summary>
///     ADO.NET-based implementation of <see cref="IBreweryRepository" /> backed by SQL Server stored
///     procedures.
/// </summary>
public class BreweryRepository(ISqlConnectionFactory connectionFactory)
    : Repository<BreweryPost>(connectionFactory),
        IBreweryRepository
{
    /// <summary>Retrieves a brewery post by ID using the <c>USP_GetBreweryById</c> stored procedure.</summary>
    public async Task<BreweryPost?> GetByIdAsync(Guid id)
    {
        await using DbConnection connection = await CreateConnection();
        await using DbCommand command = connection.CreateCommand();
        command.CommandType = CommandType.StoredProcedure;

        command.CommandText = "USP_GetBreweryById";
        AddParameter(command, "@BreweryPostID", id);

        await using DbDataReader reader = await command.ExecuteReaderAsync();
        if (await reader.ReadAsync())
            return MapToEntity(reader);
        return null;
    }

    /// <summary>
    ///     Retrieves all brewery posts, optionally paginated, using the <c>USP_GetAllBreweries</c>
    ///     stored procedure. The <c>@Limit</c> and <c>@Offset</c> parameters are only added when their
    ///     corresponding argument has a value.
    /// </summary>
    public async Task<IEnumerable<BreweryPost>> GetAllAsync(int? limit, int? offset)
    {
        await using DbConnection connection = await CreateConnection();
        await using DbCommand command = connection.CreateCommand();
        command.CommandText = "USP_GetAllBreweries";
        command.CommandType = CommandType.StoredProcedure;

        if (limit.HasValue)
            AddParameter(command, "@Limit", limit.Value);

        if (offset.HasValue)
            AddParameter(command, "@Offset", offset.Value);

        await using DbDataReader reader = await command.ExecuteReaderAsync();
        List<BreweryPost> breweries = new();

        while (await reader.ReadAsync())
            breweries.Add(MapToEntity(reader));

        return breweries;
    }

    /// <summary>
    ///     Updates a brewery post's name and description, and upserts or clears its location, using the
    ///     <c>USP_UpdateBrewery</c> stored procedure. When <paramref name="brewery" />.<c>Location</c> is
    ///     <c>null</c>, any existing location for the brewery is removed.
    /// </summary>
    public async Task UpdateAsync(BreweryPost brewery)
    {
        await using DbConnection connection = await CreateConnection();
        await using DbCommand command = connection.CreateCommand();
        command.CommandText = "USP_UpdateBrewery";
        command.CommandType = CommandType.StoredProcedure;

        AddParameter(command, "@BreweryPostID", brewery.BreweryPostId);
        AddParameter(command, "@BreweryName", brewery.BreweryName);
        AddParameter(command, "@Description", brewery.Description);
        AddParameter(command, "@BreweryPostLocationID", brewery.Location?.BreweryPostLocationId);
        AddParameter(command, "@CityID", brewery.Location?.CityId);
        AddParameter(command, "@AddressLine1", brewery.Location?.AddressLine1);
        AddParameter(command, "@AddressLine2", brewery.Location?.AddressLine2);
        AddParameter(command, "@PostalCode", brewery.Location?.PostalCode);
        AddParameter(command, "@Coordinates", brewery.Location?.Coordinates);

        await command.ExecuteNonQueryAsync();
    }

    /// <summary>
    ///     Deletes a brewery post by ID using the <c>USP_DeleteBrewery</c> stored procedure. Its location
    ///     and photos are removed via cascading foreign keys.
    /// </summary>
    public async Task DeleteAsync(Guid id)
    {
        await using DbConnection connection = await CreateConnection();
        await using DbCommand command = connection.CreateCommand();
        command.CommandText = "USP_DeleteBrewery";
        command.CommandType = CommandType.StoredProcedure;

        AddParameter(command, "@BreweryPostID", id);
        await command.ExecuteNonQueryAsync();
    }

    /// <summary>Creates a new brewery post and its location using the <c>USP_CreateBrewery</c> stored procedure.</summary>
    /// <exception cref="ArgumentException">Thrown when <paramref name="brewery" />.<c>Location</c> is <c>null</c>.</exception>
    public async Task CreateAsync(BreweryPost brewery)
    {
        await using DbConnection connection = await CreateConnection();
        await using DbCommand command = connection.CreateCommand();

        command.CommandText = "USP_CreateBrewery";
        command.CommandType = CommandType.StoredProcedure;

        if (brewery.Location is null)
            throw new ArgumentException("Location must be provided when creating a brewery.");

        AddParameter(command, "@BreweryName", brewery.BreweryName);
        AddParameter(command, "@Description", brewery.Description);
        AddParameter(command, "@PostedByID", brewery.PostedById);
        AddParameter(command, "@CityID", brewery.Location?.CityId);
        AddParameter(command, "@AddressLine1", brewery.Location?.AddressLine1);
        AddParameter(command, "@AddressLine2", brewery.Location?.AddressLine2);
        AddParameter(command, "@PostalCode", brewery.Location?.PostalCode);
        AddParameter(command, "@Coordinates", brewery.Location?.Coordinates);
        await command.ExecuteNonQueryAsync();
    }

    /// <summary>
    ///     Maps the current row of <paramref name="reader" /> to a <see cref="BreweryPost" />, including its
    ///     associated <see cref="BreweryPostLocation" /> if location columns are present in the result set.
    /// </summary>
    protected override BreweryPost MapToEntity(DbDataReader reader)
    {
        BreweryPost brewery = new();

        int ordBreweryPostId = reader.GetOrdinal("BreweryPostId");
        int ordPostedById = reader.GetOrdinal("PostedById");
        int ordBreweryName = reader.GetOrdinal("BreweryName");
        int ordDescription = reader.GetOrdinal("Description");
        int ordCreatedAt = reader.GetOrdinal("CreatedAt");
        int ordUpdatedAt = reader.GetOrdinal("UpdatedAt");
        int ordTimer = reader.GetOrdinal("Timer");

        brewery.BreweryPostId = reader.GetGuid(ordBreweryPostId);
        brewery.PostedById = reader.GetGuid(ordPostedById);
        brewery.BreweryName = reader.GetString(ordBreweryName);
        brewery.Description = reader.GetString(ordDescription);
        brewery.CreatedAt = reader.GetDateTime(ordCreatedAt);

        brewery.UpdatedAt = reader.IsDBNull(ordUpdatedAt) ? null : reader.GetDateTime(ordUpdatedAt);

        // Read timer (varbinary/rowversion) robustly
        if (reader.IsDBNull(ordTimer))
            brewery.Timer = null;
        else
            try
            {
                brewery.Timer = reader.GetFieldValue<byte[]>(ordTimer);
            }
            catch
            {
                long length = reader.GetBytes(ordTimer, 0, null, 0, 0);
                byte[] buffer = new byte[length];
                reader.GetBytes(ordTimer, 0, buffer, 0, (int)length);
                brewery.Timer = buffer;
            }

        // Map BreweryPostLocation if columns are present
        try
        {
            int ordLocationId = reader.GetOrdinal("BreweryPostLocationId");
            if (!reader.IsDBNull(ordLocationId))
            {
                BreweryPostLocation location = new()
                {
                    BreweryPostLocationId = reader.GetGuid(ordLocationId),
                    BreweryPostId = reader.GetGuid(reader.GetOrdinal("BreweryPostId")),
                    CityId = reader.GetGuid(reader.GetOrdinal("CityId")),
                    AddressLine1 = reader.GetString(reader.GetOrdinal("AddressLine1")),
                    AddressLine2 = reader.IsDBNull(reader.GetOrdinal("AddressLine2"))
                        ? null
                        : reader.GetString(reader.GetOrdinal("AddressLine2")),
                    PostalCode = reader.GetString(reader.GetOrdinal("PostalCode")),
                    Coordinates = reader.IsDBNull(reader.GetOrdinal("Coordinates"))
                        ? null
                        : reader.GetFieldValue<byte[]>(reader.GetOrdinal("Coordinates")),
                };
                brewery.Location = location;
            }
        }
        catch (IndexOutOfRangeException)
        {
            // Location columns not present, skip mapping location
        }

        return brewery;
    }

    /// <summary>Adds a parameter to <paramref name="command" />, converting <c>null</c> to <see cref="DBNull.Value" />.</summary>
    private static void AddParameter(DbCommand command, string name, object? value)
    {
        DbParameter p = command.CreateParameter();
        p.ParameterName = name;
        p.Value = value ?? DBNull.Value;
        command.Parameters.Add(p);
    }
}
