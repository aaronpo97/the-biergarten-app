using Domain.Entities;

namespace Infrastructure.Repository.Breweries;

public interface IBreweryRepository
{
    Task<BreweryPost?> GetByIdAsync(Guid id);
    Task<IEnumerable<BreweryPost>> GetAllAsync(int? limit, int? offset);
    Task UpdateAsync(BreweryPost brewery);
    Task DeleteAsync(Guid id);
    Task CreateAsync(BreweryPost brewery);
}