using System;

namespace API.Core.Contracts.Breweries;

public class BreweryCreateDto
{
   public Guid PostedById { get; set; }
   public string BreweryName { get; set; } = string.Empty;
   public string Description { get; set; } = string.Empty;
   public BreweryLocationCreateDto Location { get; set; } = new BreweryLocationCreateDto();
}
