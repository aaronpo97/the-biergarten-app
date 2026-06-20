namespace Features.Breweries.Dtos;

/// <summary>
/// Represents the location details of an existing brewery, as returned in <see cref="BreweryDto"/>.
/// </summary>
public class BreweryLocationDto
{
    /// <summary>
    /// The unique identifier of the brewery's location record.
    /// </summary>
    public Guid BreweryPostLocationId { get; set; }

    /// <summary>
    /// The unique identifier of the brewery post that this location belongs to.
    /// </summary>
    public Guid BreweryPostId { get; set; }

    /// <summary>
    /// The unique identifier of the city in which the brewery is located.
    /// </summary>
    public Guid CityId { get; set; }

    /// <summary>
    /// The primary street address line of the brewery.
    /// </summary>
    public string AddressLine1 { get; set; } = string.Empty;

    /// <summary>
    /// An optional secondary address line (e.g. suite or unit number).
    /// </summary>
    public string? AddressLine2 { get; set; }

    /// <summary>
    /// The postal/ZIP code of the brewery's address.
    /// </summary>
    public string PostalCode { get; set; } = string.Empty;

    /// <summary>
    /// The optional geographic coordinates of the brewery, in a raw binary representation.
    /// </summary>
    public byte[]? Coordinates { get; set; }
}

/// <summary>
/// Represents a brewery post as returned by the brewery endpoints, including its metadata and
/// optional location.
/// </summary>
public class BreweryDto
{
    /// <summary>
    /// The unique identifier of the brewery post.
    /// </summary>
    public Guid BreweryPostId { get; set; }

    /// <summary>
    /// The unique identifier of the user account that created the brewery post.
    /// </summary>
    public Guid PostedById { get; set; }

    /// <summary>
    /// The name of the brewery.
    /// </summary>
    public string BreweryName { get; set; } = string.Empty;

    /// <summary>
    /// A description of the brewery.
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// The date and time at which the brewery post was created.
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// The date and time at which the brewery post was last updated, or <c>null</c> if it has never been updated.
    /// </summary>
    public DateTime? UpdatedAt { get; set; }

    /// <summary>
    /// A row-version/concurrency token used to detect conflicting concurrent updates to the brewery post.
    /// </summary>
    public byte[]? Timer { get; set; }

    /// <summary>
    /// The location details of the brewery, or <c>null</c> if no location is associated with it.
    /// </summary>
    public BreweryLocationDto? Location { get; set; }
}
