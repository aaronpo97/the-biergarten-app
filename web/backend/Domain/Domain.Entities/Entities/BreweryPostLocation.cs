namespace Domain.Entities;

public sealed record CoordinateData(double Latitude, double Longitude);


public sealed class BreweryPostLocation
{
    // PK
    public Guid BreweryPostLocationId { get; set; }

    // FK References
    public Guid BreweryPostId { get; set; }
    public Guid CityId { get; set; }

    // Attributes
    public string AddressLine1 { get; set; } = string.Empty;
    public string? AddressLine2 { get; set; }
    public string PostalCode { get; set; } = string.Empty;
    public CoordinateData? Coordinates { get; set; }

    // Audit Fields
    public byte[]? RowVersion { get; set; }

    // Navigation Properties
    public City? City { get; set; }
}
