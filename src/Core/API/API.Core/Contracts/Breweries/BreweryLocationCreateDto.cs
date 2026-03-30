using System;

namespace API.Core.Contracts.Breweries;

public class BreweryLocationCreateDto
{
   public Guid CityId { get; set; }
   public string AddressLine1 { get; set; } = string.Empty;
   public string? AddressLine2 { get; set; }
   public string PostalCode { get; set; } = string.Empty;
   public byte[]? Coordinates { get; set; }
}
