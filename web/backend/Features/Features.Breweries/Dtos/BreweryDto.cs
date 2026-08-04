namespace Features.Breweries.Dtos;

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

public class BreweryDto
{
    public Guid BreweryPostId { get; set; }

    public Guid PostedById { get; set; }

    public string BreweryName { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    /// <summary>Gets or sets the row-version/concurrency token used to detect conflicting concurrent updates.</summary>
    public byte[]? Timer { get; set; }

    public BreweryLocationDto? Location { get; set; }
}
