using Domain.Entities;

namespace Features.Breweries.Repository;

/// <summary>
///     Repository for CRUD operations on brewery post records.
/// </summary>
public interface IBreweryRepository
{
    /// <summary>Returns <c>null</c> if no brewery post exists with the given ID.</summary>
    Task<BreweryPost?> GetByIdAsync(Guid id);

    Task<IEnumerable<BreweryPost>> GetAllAsync(int? limit, int? offset);

    /// <summary>
    ///     Updates a brewery post, enforcing optimistic concurrency via <paramref name="brewery" />'s
    ///     <c>Timer</c>: the update is rejected if the row was modified since <c>Timer</c> was read.
    ///     Returns the freshly persisted brewery, including its new <c>Timer</c>.
    /// </summary>
    /// <exception cref="Domain.Exceptions.NotFoundException">
    ///     Thrown when no brewery exists with the given ID, or the given location's <c>CityId</c> does not
    ///     exist.
    /// </exception>
    /// <exception cref="Domain.Exceptions.ConflictException">
    ///     Thrown when <paramref name="brewery" />'s <c>Timer</c> no longer matches the stored row (it was
    ///     modified by another request since it was last read).
    /// </exception>
    Task<BreweryPost> UpdateAsync(BreweryPost brewery);

    Task DeleteAsync(Guid id);

    /// <summary>Creates a new brewery post, including its location details.</summary>
    /// <exception cref="ArgumentException">Thrown when <paramref name="brewery" /> has no <c>Location</c>.</exception>
    Task CreateAsync(BreweryPost brewery);
}
