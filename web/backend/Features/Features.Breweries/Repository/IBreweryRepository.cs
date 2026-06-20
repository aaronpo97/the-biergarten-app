using Domain.Entities;

namespace Features.Breweries.Repository;

/// <summary>
/// Repository for CRUD operations on brewery post records.
/// </summary>
public interface IBreweryRepository
{
    /// <summary>
    /// Retrieves a brewery post by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the brewery post.</param>
    /// <returns>The matching <see cref="BreweryPost"/>, or <c>null</c> if not found.</returns>
    Task<BreweryPost?> GetByIdAsync(Guid id);

    /// <summary>
    /// Retrieves all brewery posts, optionally paginated.
    /// </summary>
    /// <param name="limit">The maximum number of records to return, or <c>null</c> for no limit.</param>
    /// <param name="offset">The number of records to skip, or <c>null</c> for no offset.</param>
    /// <returns>The collection of matching <see cref="BreweryPost"/> records.</returns>
    Task<IEnumerable<BreweryPost>> GetAllAsync(int? limit, int? offset);

    /// <summary>
    /// Updates an existing brewery post.
    /// </summary>
    /// <param name="brewery">The brewery post containing updated values.</param>
    Task UpdateAsync(BreweryPost brewery);

    /// <summary>
    /// Deletes a brewery post by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the brewery post to delete.</param>
    Task DeleteAsync(Guid id);

    /// <summary>
    /// Creates a new brewery post, including its location details.
    /// </summary>
    /// <param name="brewery">The brewery post to create. Must have a non-null <c>Location</c>.</param>
    /// <exception cref="ArgumentException">Thrown when <paramref name="brewery"/> has no <c>Location</c>.</exception>
    Task CreateAsync(BreweryPost brewery);
}
