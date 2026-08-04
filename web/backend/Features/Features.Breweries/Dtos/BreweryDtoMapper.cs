using Domain.Entities;

namespace Features.Breweries.Dtos;

public static class BreweryDtoMapper
{
    public static BreweryDto ToDto(this BreweryPost brewery)
    {
        return new BreweryDto
        {
            BreweryPostId = brewery.BreweryPostId,
            PostedById = brewery.PostedById,
            BreweryName = brewery.BreweryName,
            Description = brewery.Description,
            CreatedAt = brewery.CreatedAt,
            UpdatedAt = brewery.UpdatedAt,
            Timer = brewery.Timer,
            Location = brewery.Location is null
                ? null
                : new BreweryLocationDto
                {
                    BreweryPostLocationId = brewery.Location.BreweryPostLocationId,
                    BreweryPostId = brewery.Location.BreweryPostId,
                    CityId = brewery.Location.CityId,
                    AddressLine1 = brewery.Location.AddressLine1,
                    AddressLine2 = brewery.Location.AddressLine2,
                    PostalCode = brewery.Location.PostalCode,
                    Coordinates = brewery.Location.Coordinates,
                },
        };
    }
}
