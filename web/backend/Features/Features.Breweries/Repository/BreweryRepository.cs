using System.Data.Common;
using Domain.Entities;
using Infrastructure.Sql;

namespace Features.Breweries.Repository;

/// <summary>
/// ADO.NET-based implementation of <see cref="IBreweryRepository"/> backed by SQL Server stored
/// procedures.
/// </summary>
/// <param name="connectionFactory">The factory used to create database connections.</param>
public class BreweryRepository(ISqlConnectionFactory connectionFactory)
    : Repository<BreweryPost>(connectionFactory), IBreweryRepository
{
    /// <summary>
    /// Retrieves a brewery post by ID using the <c>USP_GetBreweryById</c> stored procedure.
    /// </summary>
    /// <param name="id">The unique identifier of the brewery post.</param>
    /// <returns>The matching <see cref="BreweryPost"/>, or <c>null</c> if not found.</returns>
    /// <exception cref="Microsoft.Data.SqlClient.SqlException">Thrown when the database command fails.</exception>
    public async Task<BreweryPost?> GetByIdAsync(Guid id)
    {
        await using var connection = await CreateConnection();
        await using var command = connection.CreateCommand();
        command.CommandType = System.Data.CommandType.StoredProcedure;

        command.CommandText = "USP_GetBreweryById";
        AddParameter(command, "@BreweryPostID", id);

        await using var reader = await command.ExecuteReaderAsync();
        if (await reader.ReadAsync())
        {
            return MapToEntity(reader);
        }
        return null;
    }

    /// <summary>
    /// Retrieves all brewery posts, optionally paginated, using the <c>USP_GetAllBreweries</c>
    /// stored procedure. The <c>@Limit</c> and <c>@Offset</c> parameters are only added when their
    /// corresponding argument has a value.
    /// </summary>
    /// <param name="limit">The maximum number of records to return, or <c>null</c> for no limit.</param>
    /// <param name="offset">The number of records to skip, or <c>null</c> for no offset.</param>
    /// <returns>The collection of matching <see cref="BreweryPost"/> records.</returns>
    /// <exception cref="Microsoft.Data.SqlClient.SqlException">Thrown when the database command fails.</exception>
    public async Task<IEnumerable<BreweryPost>> GetAllAsync(int? limit, int? offset)
    {
        await using var connection = await CreateConnection();
        await using var command = connection.CreateCommand();
        command.CommandText = "USP_GetAllBreweries";
        command.CommandType = System.Data.CommandType.StoredProcedure;

        if (limit.HasValue)
            AddParameter(command, "@Limit", limit.Value);

        if (offset.HasValue)
            AddParameter(command, "@Offset", offset.Value);

        await using var reader = await command.ExecuteReaderAsync();
        var breweries = new List<BreweryPost>();

        while (await reader.ReadAsync())
        {
            breweries.Add(MapToEntity(reader));
        }

        return breweries;
    }

    /// <summary>
    /// Updates a brewery post's name and description, and upserts or clears its location, using the
    /// <c>USP_UpdateBrewery</c> stored procedure. When <paramref name="brewery"/>.<c>Location</c> is
    /// <c>null</c>, any existing location for the brewery is removed.
    /// </summary>
    /// <param name="brewery">The brewery post containing updated values.</param>
    /// <exception cref="Microsoft.Data.SqlClient.SqlException">Thrown when the database command fails.</exception>
    public async Task UpdateAsync(BreweryPost brewery)
    {
        await using var connection = await CreateConnection();
        await using var command = connection.CreateCommand();
        command.CommandText = "USP_UpdateBrewery";
        command.CommandType = System.Data.CommandType.StoredProcedure;

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
    /// Deletes a brewery post by ID using the <c>USP_DeleteBrewery</c> stored procedure. Its location
    /// and photos are removed via cascading foreign keys.
    /// </summary>
    /// <param name="id">The unique identifier of the brewery post to delete.</param>
    /// <exception cref="Microsoft.Data.SqlClient.SqlException">Thrown when the database command fails.</exception>
    public async Task DeleteAsync(Guid id)
    {
        await using var connection = await CreateConnection();
        await using var command = connection.CreateCommand();
        command.CommandText = "USP_DeleteBrewery";
        command.CommandType = System.Data.CommandType.StoredProcedure;

        AddParameter(command, "@BreweryPostID", id);
        await command.ExecuteNonQueryAsync();
    }

    /// <summary>
    /// Creates a new brewery post and its location using the <c>USP_CreateBrewery</c> stored procedure.
    /// </summary>
    /// <param name="brewery">The brewery post to create. Must have a non-null <c>Location</c>.</param>
    /// <exception cref="ArgumentException">Thrown when <paramref name="brewery"/>.<c>Location</c> is <c>null</c>.</exception>
    /// <exception cref="Microsoft.Data.SqlClient.SqlException">Thrown when the database command fails.</exception>
    public async Task CreateAsync(BreweryPost brewery)
    {
        await using var connection = await CreateConnection();
        await using var command = connection.CreateCommand();

        command.CommandText = "USP_CreateBrewery";
        command.CommandType = System.Data.CommandType.StoredProcedure;

        if (brewery.Location is null)
        {
            throw new ArgumentException("Location must be provided when creating a brewery.");
        }

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
    /// Maps the current row of a data reader to a <see cref="BreweryPost"/> entity, including its
    /// rowversion <c>Timer</c> field and, if location columns are present in the result set, its
    /// associated <see cref="BreweryPostLocation"/>.
    /// </summary>
    /// <param name="reader">The data reader positioned on the row to map.</param>
    /// <returns>The mapped <see cref="BreweryPost"/> instance.</returns>
    protected override BreweryPost MapToEntity(DbDataReader reader)
    {
        var brewery = new BreweryPost();

        var ordBreweryPostId = reader.GetOrdinal("BreweryPostId");
        var ordPostedById = reader.GetOrdinal("PostedById");
        var ordBreweryName = reader.GetOrdinal("BreweryName");
        var ordDescription = reader.GetOrdinal("Description");
        var ordCreatedAt = reader.GetOrdinal("CreatedAt");
        var ordUpdatedAt = reader.GetOrdinal("UpdatedAt");
        var ordTimer = reader.GetOrdinal("Timer");

        brewery.BreweryPostId = reader.GetGuid(ordBreweryPostId);
        brewery.PostedById = reader.GetGuid(ordPostedById);
        brewery.BreweryName = reader.GetString(ordBreweryName);
        brewery.Description = reader.GetString(ordDescription);
        brewery.CreatedAt = reader.GetDateTime(ordCreatedAt);

        brewery.UpdatedAt = reader.IsDBNull(ordUpdatedAt) ? null : reader.GetDateTime(ordUpdatedAt);

        // Read timer (varbinary/rowversion) robustly
        if (reader.IsDBNull(ordTimer))
        {
            brewery.Timer = null;
        }
        else
        {
            try
            {
                brewery.Timer = reader.GetFieldValue<byte[]>(ordTimer);
            }
            catch
            {
                var length = reader.GetBytes(ordTimer, 0, null, 0, 0);
                var buffer = new byte[length];
                reader.GetBytes(ordTimer, 0, buffer, 0, (int)length);
                brewery.Timer = buffer;
            }
        }

        // Map BreweryPostLocation if columns are present
        try
        {
            var ordLocationId = reader.GetOrdinal("BreweryPostLocationId");
            if (!reader.IsDBNull(ordLocationId))
            {
                var location = new BreweryPostLocation
                {
                    BreweryPostLocationId = reader.GetGuid(ordLocationId),
                    BreweryPostId = reader.GetGuid(reader.GetOrdinal("BreweryPostId")),
                    CityId = reader.GetGuid(reader.GetOrdinal("CityId")),
                    AddressLine1 = reader.GetString(reader.GetOrdinal("AddressLine1")),
                    AddressLine2 = reader.IsDBNull(reader.GetOrdinal("AddressLine2")) ? null : reader.GetString(reader.GetOrdinal("AddressLine2")),
                    PostalCode = reader.GetString(reader.GetOrdinal("PostalCode")),
                    Coordinates = reader.IsDBNull(reader.GetOrdinal("Coordinates")) ? null : reader.GetFieldValue<byte[]>(reader.GetOrdinal("Coordinates"))
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

    /// <summary>
    /// Helper method to add a parameter to a database command, converting <c>null</c> values to
    /// <see cref="DBNull.Value"/>.
    /// </summary>
    /// <param name="command">The command to add the parameter to.</param>
    /// <param name="name">The parameter name (including any prefix, e.g. "@BreweryName").</param>
    /// <param name="value">The parameter value, or <c>null</c> to bind <see cref="DBNull.Value"/>.</param>
    private static void AddParameter(
        DbCommand command,
        string name,
        object? value
    )
    {
        var p = command.CreateParameter();
        p.ParameterName = name;
        p.Value = value ?? DBNull.Value;
        command.Parameters.Add(p);
    }
}
