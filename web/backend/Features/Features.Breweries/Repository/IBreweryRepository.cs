using Domain.Entities;

namespace Features.Breweries.Repository;

/// <summary>
///     Repository for CRUD operations on brewery post records.
/// </summary>
public interface IBreweryRepository
{
    /// <summary>Retrieves a brewery post by ID, or <c>null</c> if not found.</summary>
    Task<BreweryPost?> GetByIdAsync(Guid id);

    Task<IEnumerable<BreweryPost>> GetAllAsync(int? limit, int? offset);

    Task UpdateAsync(BreweryPost brewery);

    Task DeleteAsync(Guid id);

    /// <summary>Creates a new brewery post, including its location details.</summary>
    /// <exception cref="ArgumentException">Thrown when <paramref name="brewery" /> has no <c>Location</c>.</exception>
    Task CreateAsync(BreweryPost brewery);
}
