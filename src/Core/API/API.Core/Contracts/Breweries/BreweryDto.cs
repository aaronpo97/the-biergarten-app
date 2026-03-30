namespace API.Core.Contracts.Breweries;

public class BreweryLocationCreateDto
{
    public Guid CityId { get; set; }
    public string AddressLine1 { get; set; } = string.Empty;
    public string? AddressLine2 { get; set; }
    public string PostalCode { get; set; } = string.Empty;
    public byte[]? Coordinates { get; set; }
}

public class BreweryLocationDto
{
    public Guid BreweryPostLocationId { get; set; }
    public Guid BreweryPostId { get; set; }
    public Guid CityId { get; set; }
    public string AddressLine1 { get; set; } = string.Empty;
    public string? AddressLine2 { get; set; }
    public string PostalCode { get; set; } = string.Empty;
    public byte[]? Coordinates { get; set; }
}

public class BreweryCreateDto
{
    public Guid PostedById { get; set; }
    public string BreweryName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public BreweryLocationCreateDto Location { get; set; } = null!;
}

public class BreweryDto
{
    public Guid BreweryPostId { get; set; }
    public Guid PostedById { get; set; }
    public string BreweryName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public byte[]? Timer { get; set; }
    public BreweryLocationDto? Location { get; set; }
}
