using Domain.Entities;

namespace Features.Breweries.Dtos;

/// <summary>Maps <see cref="BreweryPost" /> domain entities to <see cref="BreweryDto" />.</summary>
public static class BreweryDtoMapper
{
    /// <summary>
    ///     Converts a <see cref="BreweryPost" /> to its DTO representation, including its
    ///     <see cref="BreweryDto.Location" /> if the entity has one.
    /// </summary>
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
