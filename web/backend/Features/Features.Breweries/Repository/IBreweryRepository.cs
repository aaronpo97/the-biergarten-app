using Domain.Entities;

namespace Features.Breweries.Repository;

/// <summary>
///     Defines persistence operations for brewery posts.
/// </summary>
public interface IBreweryRepository
{
    /// <summary>
    ///     Gets a brewery post and its location data by identifier.
    /// </summary>
    Task<BreweryPost?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    ///     Gets the identifier of the user who created a brewery post.
    /// </summary>
    Task<Guid?> GetPostedByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    ///     Gets brewery posts ordered by creation time, with optional paging.
    /// </summary>
    /// <param name="limit">
    ///     Limits returned posts; <see langword="null" /> applies no limit.
    /// </param>
    /// <param name="offset">
    ///     Skips returned posts; <see langword="null" /> skips none.
    /// </param>
    Task<IEnumerable<BreweryPost>> GetAllAsync(int? limit, int? offset);

    /// <summary>
    ///     Gets located brewery posts within a radius, ordered by distance.
    /// </summary>
    /// <param name="coords">
    ///     Sets the point from which distance is measured.
    /// </param>
    /// <param name="rangeInMetres">
    ///     Sets the maximum search distance in metres.
    /// </param>
    Task<IEnumerable<BreweryPost>> GetAllLocationsWithinRange(
        CoordinateData coords,
        double rangeInMetres
    );

    /// <summary>
    ///     Gets brewery posts with location data.
    /// </summary>
    Task<IEnumerable<BreweryPost>> GetAllLocations();

    /// <summary>
    ///     Saves a brewery post and its location using optimistic concurrency.
    /// </summary>
    /// <exception cref="Domain.Exceptions.NotFoundException">
    ///     Thrown if the brewery post or its requested city cannot be found.
    /// </exception>
    /// <exception cref="Domain.Exceptions.ConflictException">
    ///     Thrown if the supplied row version is no longer current.
    /// </exception>
    Task<BreweryPost> UpdateAsync(
        BreweryPost brewery,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    ///     Deletes a brewery post and its dependent records.
    /// </summary>
    /// <exception cref="Domain.Exceptions.NotFoundException">
    ///     Thrown if the brewery post cannot be found.
    /// </exception>
    Task DeleteAsync(Guid id);

    /// <summary>
    ///     Creates a brewery post and its required location.
    /// </summary>
    /// <exception cref="ArgumentException">
    ///     Thrown if <paramref name="brewery" /> has no location.
    /// </exception>
    /// <exception cref="Domain.Exceptions.NotFoundException">
    ///     Thrown if the posting user or location city cannot be found.
    /// </exception>
    Task CreateAsync(BreweryPost brewery);
}
