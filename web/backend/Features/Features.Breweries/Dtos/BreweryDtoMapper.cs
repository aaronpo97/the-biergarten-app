using Domain.Entities;

namespace Features.Breweries.Dtos;

/// <summary>
///     Maps <see cref="BreweryPost" /> domain entities to their <see cref="BreweryDto" /> wire representation.
/// </summary>
public static class BreweryDtoMapper
{
    /// <summary>
    ///     Maps a <see cref="BreweryPost" /> domain entity to its <see cref="BreweryDto" /> representation,
    ///     including its location, if present.
    /// </summary>
    /// <param name="brewery">The brewery post entity to map.</param>
    /// <returns>The mapped <see cref="BreweryDto" />.</returns>
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
                    Coordinates = brewery.Location.Coordinates
                }
        };
    }
}