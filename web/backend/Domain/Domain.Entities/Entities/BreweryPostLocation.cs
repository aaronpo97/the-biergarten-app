namespace Domain.Entities;

public class BreweryPostLocation
{
   public Guid BreweryPostLocationId { get; set; }
   public Guid BreweryPostId { get; set; }
   public string AddressLine1 { get; set; } = string.Empty;
   public string? AddressLine2 { get; set; }
   public string PostalCode { get; set; } = string.Empty;
   public Guid CityId { get; set; }
   public byte[]? Coordinates { get; set; }
   public byte[]? Timer { get; set; }
}
