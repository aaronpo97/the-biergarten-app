using Domain.Entities;
using Infrastructure.Repository.Breweries;

namespace Service.Breweries;

/// <summary>
/// Handles retrieval, creation, update, and deletion of brewery posts.
/// </summary>
/// <param name="repository">Repository used to persist and query brewery post data.</param>
public class BreweryService(IBreweryRepository repository) : IBreweryService
{
    /// <summary>
    /// Retrieves a brewery post by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the brewery post.</param>
    /// <returns>The matching <see cref="BreweryPost"/>, or <c>null</c> if no such post exists.</returns>
    public Task<BreweryPost?> GetByIdAsync(Guid id) =>
        repository.GetByIdAsync(id);

    /// <summary>
    /// Retrieves all brewery posts, optionally paginated.
    /// </summary>
    /// <param name="limit">The maximum number of results to return, or <c>null</c> for no limit.</param>
    /// <param name="offset">The number of results to skip, or <c>null</c> to start from the beginning.</param>
    /// <returns>A collection of <see cref="BreweryPost"/> entities.</returns>
    public Task<IEnumerable<BreweryPost>> GetAllAsync(int? limit = null, int? offset = null) =>
        repository.GetAllAsync(limit, offset);

    /// <summary>
    /// Creates a new brewery post, generating new identifiers for the post and its location.
    /// </summary>
    /// <param name="request">The details of the brewery post to create.</param>
    /// <returns>A successful <see cref="BreweryServiceReturn"/> wrapping the newly created brewery post.</returns>
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

    /// <summary>
    /// Updates an existing brewery post. If <paramref name="request"/> has no <c>Location</c>,
    /// the brewery's location is cleared.
    /// </summary>
    /// <param name="request">The updated details of the brewery post.</param>
    /// <returns>A successful <see cref="BreweryServiceReturn"/> wrapping the updated brewery post.</returns>
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

    /// <summary>
    /// Deletes a brewery post by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the brewery post to delete.</param>
    /// <returns>A task that completes once the deletion has finished.</returns>
    public Task DeleteAsync(Guid id) =>
        repository.DeleteAsync(id);
}
