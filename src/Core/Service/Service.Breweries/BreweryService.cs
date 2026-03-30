using Domain.Entities;
using Infrastructure.Repository.Breweries;

namespace Service.Breweries;

public class BreweryService(IBreweryRepository repository) : IBreweryService
{
    public Task<BreweryPost?> GetByIdAsync(Guid id) =>
        repository.GetByIdAsync(id);

    public Task<IEnumerable<BreweryPost>> GetAllAsync(int? limit = null, int? offset = null) =>
        repository.GetAllAsync(limit, offset);

    public async Task<BreweryServiceReturn> CreateAsync(BreweryCreateRequest request)
    {
        var entity = new BreweryPost
        {
            BreweryPostId = Guid.NewGuid(),
            PostedById = request.PostedById,
            BreweryName = request.BreweryName,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow,
            Location = new BreweryPostLocation
            {
                BreweryPostLocationId = Guid.NewGuid(),
                CityId = request.Location.CityId,
                AddressLine1 = request.Location.AddressLine1,
                AddressLine2 = request.Location.AddressLine2,
                PostalCode = request.Location.PostalCode,
                Coordinates = request.Location.Coordinates,
            },
        };

        await repository.CreateAsync(entity);
        return new BreweryServiceReturn(entity);
    }

    public async Task<BreweryServiceReturn> UpdateAsync(BreweryUpdateRequest request)
    {
        var entity = new BreweryPost
        {
            BreweryPostId = request.BreweryPostId,
            PostedById = request.PostedById,
            BreweryName = request.BreweryName,
            Description = request.Description,
            UpdatedAt = DateTime.UtcNow,
            Location = request.Location is null ? null : new BreweryPostLocation
            {
                BreweryPostLocationId = request.Location.BreweryPostLocationId,
                BreweryPostId = request.BreweryPostId,
                CityId = request.Location.CityId,
                AddressLine1 = request.Location.AddressLine1,
                AddressLine2 = request.Location.AddressLine2,
                PostalCode = request.Location.PostalCode,
                Coordinates = request.Location.Coordinates,
            },
        };

        await repository.UpdateAsync(entity);
        return new BreweryServiceReturn(entity);
    }

    public Task DeleteAsync(Guid id) =>
        repository.DeleteAsync(id);
}
