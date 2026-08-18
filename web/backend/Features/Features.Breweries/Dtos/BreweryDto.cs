namespace Features.Breweries.Dtos;

/// <summary>Location details of a brewery, as returned by the API.</summary>
public class BreweryLocationDto
{
    public Guid BreweryPostLocationId { get; set; }

    public Guid BreweryPostId { get; set; }

    public Guid CityId { get; set; }

    public string AddressLine1 { get; set; } = string.Empty;

    public string? AddressLine2 { get; set; }

    public string PostalCode { get; set; } = string.Empty;

    /// <summary>Gets or sets the brewery's geographic coordinates, in a raw binary representation.</summary>
    public byte[]? Coordinates { get; set; }
}

/// <summary>A brewery post, as returned by the API.</summary>
public class BreweryDto
{
    public Guid BreweryPostId { get; set; }

    public Guid PostedById { get; set; }

    public string BreweryName { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    /// <summary>Gets or sets the date and time of the last edit, or <see langword="null"/> if never edited.</summary>
    public DateTime? UpdatedAt { get; set; }

    /// <summary>Gets or sets the row-version/concurrency token used to detect conflicting concurrent updates.</summary>
    public byte[]? Timer { get; set; }

    /// <summary>Gets or sets the brewery's location, or <see langword="null"/> if none has been set.</summary>
    public BreweryLocationDto? Location { get; set; }
}
