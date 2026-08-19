using Domain.Entities;

namespace Features.Breweries.Repository;

/// <summary>
///     Repository for CRUD operations on brewery post records.
/// </summary>
public interface IBreweryRepository
{
    /// <summary>
    ///     Retrieves a brewery post by ID, joined to its location. Returns <c>null</c> if no brewery post
    ///     exists with the given ID, or if it has no associated location.
    /// </summary>
    Task<BreweryPost?> GetByIdAsync(Guid id);

    /// <summary>
    ///     Retrieves all brewery posts, optionally paginated, ordered by creation date descending. Posts
    ///     without a location are included, with <see cref="BreweryPost.Location" /> left <c>null</c>.
    /// </summary>
    /// <param name="limit">Maximum number of rows to return. Unbounded if <see langword="null" />.</param>
    /// <param name="offset">Number of rows to skip. Treated as zero if <see langword="null" />.</param>
    Task<IEnumerable<BreweryPost>> GetAllAsync(int? limit, int? offset);

    /// <summary>
    ///     Updates a brewery post's name and description, and upserts or clears its location, enforcing
    ///     optimistic concurrency via <paramref name="brewery" />'s <c>RowVersion</c>: the update is rejected
    ///     if the row was modified since <c>RowVersion</c> was read. When <paramref name="brewery" />'s
    ///     <c>Location</c> is <c>null</c>, any existing location for the brewery is removed.
    ///     Returns the freshly persisted brewery, including its new <c>RowVersion</c>.
    /// </summary>
    /// <exception cref="Domain.Exceptions.NotFoundException">
    ///     Thrown when no brewery exists with the given ID, or the given location's <c>CityId</c> does not
    ///     exist.
    /// </exception>
    /// <exception cref="Domain.Exceptions.ConflictException">
    ///     Thrown when <paramref name="brewery" />'s <c>RowVersion</c> no longer matches the stored row (it was
    ///     modified by another request since it was last read).
    /// </exception>
    Task<BreweryPost> UpdateAsync(BreweryPost brewery);

    /// <summary>Deletes a brewery post by ID. Its location and photos are removed via cascading foreign keys.</summary>
    /// <exception cref="Domain.Exceptions.NotFoundException">Thrown when no brewery exists with the given <paramref name="id" />.</exception>
    Task DeleteAsync(Guid id);

    /// <summary>Creates a new brewery post, including its location details.</summary>
    /// <exception cref="ArgumentException">Thrown when <paramref name="brewery" /> has no <c>Location</c>.</exception>
    /// <exception cref="Domain.Exceptions.NotFoundException">
    ///     Thrown when <paramref name="brewery" />'s <c>PostedById</c> or <c>Location.CityId</c> does not exist.
    /// </exception>
    Task CreateAsync(BreweryPost brewery);
}
