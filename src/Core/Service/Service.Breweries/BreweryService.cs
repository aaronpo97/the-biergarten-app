using Domain.Entities;
using Infrastructure.Repository.Breweries;
using API.Core.Contracts.Breweries;

namespace Service.Breweries;

public class BreweryService(IBreweryRepository repository) : IBreweryService
{
   private readonly IBreweryRepository _repository = repository;

   public Task<BreweryPost?> GetByIdAsync(Guid id) => _repository.GetByIdAsync(id);

   public Task<IEnumerable<BreweryPost>> GetAllAsync(int? limit = null, int? offset = null) => _repository.GetAllAsync(limit, offset);

   public async Task<BreweryServiceReturn> CreateAsync(BreweryCreateDto brewery)
   {
      if (brewery.Location is null)
         return new BreweryServiceReturn("Location must be provided");

      var entity = new BreweryPost
      {
         BreweryPostId = Guid.NewGuid(),
         PostedById = brewery.PostedById,
         BreweryName = brewery.BreweryName,
         Description = brewery.Description,
         CreatedAt = DateTime.UtcNow,
         Location = new BreweryPostLocation
         {
            BreweryPostLocationId = Guid.NewGuid(),
            CityId = brewery.Location.CityId,
            AddressLine1 = brewery.Location.AddressLine1,
            AddressLine2 = brewery.Location.AddressLine2,
            PostalCode = brewery.Location.PostalCode,
            Coordinates = brewery.Location.Coordinates
         }
      };

      await _repository.CreateAsync(entity);
      return new BreweryServiceReturn(entity);
   }

   public async Task<BreweryServiceReturn> UpdateAsync(BreweryDto brewery)
   {
      if (brewery is null) return new BreweryServiceReturn("Brewery payload is null");

      var entity = new BreweryPost
      {
         BreweryPostId = brewery.BreweryPostId,
         PostedById = brewery.PostedById,
         BreweryName = brewery.BreweryName,
         Description = brewery.Description,
         CreatedAt = brewery.CreatedAt,
         UpdatedAt = brewery.UpdatedAt,
         Timer = brewery.Timer,
         Location = brewery.Location is null ? null : new BreweryPostLocation
         {
            BreweryPostLocationId = brewery.Location.BreweryPostLocationId,
            BreweryPostId = brewery.BreweryPostId,
            CityId = brewery.Location.CityId,
            AddressLine1 = brewery.Location.AddressLine1,
            AddressLine2 = brewery.Location.AddressLine2,
            PostalCode = brewery.Location.PostalCode,
            Coordinates = brewery.Location.Coordinates
         }
      };

      await _repository.UpdateAsync(entity);
      return new BreweryServiceReturn(entity);
   }

   public Task DeleteAsync(Guid id) => _repository.DeleteAsync(id);
}
