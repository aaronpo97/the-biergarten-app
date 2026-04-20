using System.Data.Common;
using Domain.Entities;
using Infrastructure.Repository.Sql;

namespace Infrastructure.Repository.Breweries;

public class BreweryRepository(ISqlConnectionFactory connectionFactory)
    : Repository<BreweryPost>(connectionFactory), IBreweryRepository
{
    private readonly ISqlConnectionFactory _connectionFactory = connectionFactory;

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

    public Task<IEnumerable<BreweryPost>> GetAllAsync(int? limit, int? offset)
    {
        throw new NotImplementedException();
    }

    public Task UpdateAsync(BreweryPost brewery)
    {
        throw new NotImplementedException();
    }

    public Task DeleteAsync(Guid id)
    {
        throw new NotImplementedException();
    }

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
