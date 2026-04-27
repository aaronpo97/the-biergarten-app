using Domain.Entities;

namespace Service.Breweries;

public record BreweryCreateRequest(
    Guid PostedById,
    string BreweryName,
    string Description,
    BreweryLocationCreateRequest Location
);

public record BreweryLocationCreateRequest(
    Guid CityId,
    string AddressLine1,
    string? AddressLine2,
    string PostalCode,
    byte[]? Coordinates
);

public record BreweryUpdateRequest(
    Guid BreweryPostId,
    Guid PostedById,
    string BreweryName,
    string Description,
    BreweryLocationUpdateRequest? Location
);

public record BreweryLocationUpdateRequest(
    Guid BreweryPostLocationId,
    Guid CityId,
    string AddressLine1,
    string? AddressLine2,
    string PostalCode,
    byte[]? Coordinates
);

public record BreweryServiceReturn
{
    public bool Success { get; init; }
    public BreweryPost Brewery { get; init; }
    public string Message { get; init; } = string.Empty;

    public BreweryServiceReturn(BreweryPost brewery)
    {
        Success = true;
        Brewery = brewery;
    }

    public BreweryServiceReturn(string message)
    {
        Success = false;
        Brewery = default!;
        Message = message;
    }
}

public interface IBreweryService
{
    Task<BreweryPost?> GetByIdAsync(Guid id);
    Task<IEnumerable<BreweryPost>> GetAllAsync(int? limit = null, int? offset = null);
    Task<BreweryServiceReturn> CreateAsync(BreweryCreateRequest request);
    Task<BreweryServiceReturn> UpdateAsync(BreweryUpdateRequest request);
    Task DeleteAsync(Guid id);
}
