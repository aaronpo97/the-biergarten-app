using System.Data.Common;
using Domain.Entities;
using Infrastructure.Repository.Sql;

namespace Infrastructure.Repository.Breweries;

public interface IBreweryRepository
{
    Task<BreweryPost?> GetByIdAsync(Guid id);
    Task<IEnumerable<BreweryPost>> GetAllAsync(int? limit, int? offset);
    Task UpdateAsync(BreweryPost brewery);
    Task DeleteAsync(Guid id);
    Task CreateAsync(BreweryPost brewery);
}

public class BreweryRepository(ISqlConnectionFactory connectionFactory)
    : Repository<BreweryPost>(connectionFactory),
        IBreweryRepository
{
    private static ISqlConnectionFactory? _connectionFactory;

    public Task<BreweryPost?> GetByIdAsync(Guid id)
    {
        throw new NotImplementedException();
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

    public async Task CreateAsync(BreweryPost brewery, BreweryPostLocation location)
    {
        await using var connection = await CreateConnection();
        await using var command = connection.CreateCommand();

        command.CommandText = "USP_CreateBreweryPost";
        command.CommandType = System.Data.CommandType.StoredProcedure;

        AddParameter(command, "@BreweryName", brewery.BreweryName);
        AddParameter(command, "@Description", brewery.Description);
        AddParameter(command, "@PostedByID", brewery.PostedById);
        AddParameter(command, "@CityID", location.CityId);
        AddParameter(command, "@AddressLine1", location.AddressLine1);
        AddParameter(command, "@AddressLine2", location.AddressLine2);
        AddParameter(command, "@PostalCode", location.PostalCode);
        AddParameter(command, "@Coordinates", location.Coordinates);
        await command.ExecuteNonQueryAsync();

    }

    protected override BreweryPost MapToEntity(DbDataReader reader)
    {
        throw new NotImplementedException();
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

    public Task CreateAsync(BreweryPost brewery)
    {
        throw new NotImplementedException();
    }
}
