using Domain.Entities;

namespace Service.Breweries;

/// <summary>
/// Represents the data required to create a new brewery post.
/// </summary>
/// <param name="PostedById">The unique identifier of the user creating the post.</param>
/// <param name="BreweryName">The name of the brewery.</param>
/// <param name="Description">A description of the brewery.</param>
/// <param name="Location">The location details for the new brewery post.</param>
public record BreweryCreateRequest(
    Guid PostedById,
    string BreweryName,
    string Description,
    BreweryLocationCreateRequest Location
);

/// <summary>
/// Represents the location data required to create a new brewery post.
/// </summary>
/// <param name="CityId">The unique identifier of the city the brewery is located in.</param>
/// <param name="AddressLine1">The primary address line.</param>
/// <param name="AddressLine2">An optional secondary address line.</param>
/// <param name="PostalCode">The postal code of the brewery's address.</param>
/// <param name="Coordinates">Optional geographic coordinates for the brewery's location.</param>
public record BreweryLocationCreateRequest(
    Guid CityId,
    string AddressLine1,
    string? AddressLine2,
    string PostalCode,
    byte[]? Coordinates
);

/// <summary>
/// Represents the data required to update an existing brewery post.
/// </summary>
/// <param name="BreweryPostId">The unique identifier of the brewery post to update.</param>
/// <param name="PostedById">The unique identifier of the user who owns/posted the brewery.</param>
/// <param name="BreweryName">The updated name of the brewery.</param>
/// <param name="Description">The updated description of the brewery.</param>
/// <param name="Location">The updated location details, or <c>null</c> to clear the location.</param>
public record BreweryUpdateRequest(
    Guid BreweryPostId,
    Guid PostedById,
    string BreweryName,
    string Description,
    BreweryLocationUpdateRequest? Location
);

/// <summary>
/// Represents the location data required to update an existing brewery post.
/// </summary>
/// <param name="BreweryPostLocationId">The unique identifier of the existing brewery location record.</param>
/// <param name="CityId">The unique identifier of the city the brewery is located in.</param>
/// <param name="AddressLine1">The primary address line.</param>
/// <param name="AddressLine2">An optional secondary address line.</param>
/// <param name="PostalCode">The postal code of the brewery's address.</param>
/// <param name="Coordinates">Optional geographic coordinates for the brewery's location.</param>
public record BreweryLocationUpdateRequest(
    Guid BreweryPostLocationId,
    Guid CityId,
    string AddressLine1,
    string? AddressLine2,
    string PostalCode,
    byte[]? Coordinates
);

/// <summary>
/// Represents the result of a create or update operation against a brewery post.
/// </summary>
public record BreweryServiceReturn
{
    /// <summary>
    /// Gets a value indicating whether the operation succeeded.
    /// </summary>
    public bool Success { get; init; }

    /// <summary>
    /// Gets the resulting brewery post when the operation succeeded; otherwise a default/unset value.
    /// </summary>
    public BreweryPost Brewery { get; init; }

    /// <summary>
    /// Gets a message describing the failure reason, empty when <see cref="Success"/> is <c>true</c>.
    /// </summary>
    public string Message { get; init; } = string.Empty;

    /// <summary>
    /// Initializes a new successful result wrapping the given brewery post.
    /// </summary>
    /// <param name="brewery">The brewery post resulting from the operation.</param>
    public BreweryServiceReturn(BreweryPost brewery)
    {
        Success = true;
        Brewery = brewery;
    }

    /// <summary>
    /// Initializes a new failed result with the given error message.
    /// </summary>
    /// <param name="message">A message describing why the operation failed.</param>
    public BreweryServiceReturn(string message)
    {
        Success = false;
        Brewery = default!;
        Message = message;
    }
}

/// <summary>
/// Defines operations for retrieving, creating, updating, and deleting brewery posts.
/// </summary>
public interface IBreweryService
{
    /// <summary>
    /// Retrieves a brewery post by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the brewery post.</param>
    /// <returns>The matching <see cref="BreweryPost"/>, or <c>null</c> if no such post exists.</returns>
    Task<BreweryPost?> GetByIdAsync(Guid id);

    /// <summary>
    /// Retrieves all brewery posts, optionally paginated.
    /// </summary>
    /// <param name="limit">The maximum number of results to return, or <c>null</c> for no limit.</param>
    /// <param name="offset">The number of results to skip, or <c>null</c> to start from the beginning.</param>
    /// <returns>A collection of <see cref="BreweryPost"/> entities.</returns>
    Task<IEnumerable<BreweryPost>> GetAllAsync(int? limit = null, int? offset = null);

    /// <summary>
    /// Creates a new brewery post.
    /// </summary>
    /// <param name="request">The details of the brewery post to create.</param>
    /// <returns>A <see cref="BreweryServiceReturn"/> describing the outcome of the creation.</returns>
    Task<BreweryServiceReturn> CreateAsync(BreweryCreateRequest request);

    /// <summary>
    /// Updates an existing brewery post.
    /// </summary>
    /// <param name="request">The updated details of the brewery post.</param>
    /// <returns>A <see cref="BreweryServiceReturn"/> describing the outcome of the update.</returns>
    Task<BreweryServiceReturn> UpdateAsync(BreweryUpdateRequest request);

    /// <summary>
    /// Deletes a brewery post by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the brewery post to delete.</param>
    /// <returns>A task that completes once the deletion has finished.</returns>
    Task DeleteAsync(Guid id);
}
