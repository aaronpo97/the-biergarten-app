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
        return new BreweryDto(
            BreweryPostId: brewery.BreweryPostId,
            PostedById: brewery.PostedById,
            BreweryName: brewery.BreweryName,
            Description: brewery.Description,
            CreatedAt: brewery.CreatedAt,
            UpdatedAt: brewery.UpdatedAt,
            RowVersion: brewery.RowVersion,
            Location: brewery.Location is null
                ? null
                : new BreweryLocationDto(
                    BreweryPostLocationId: brewery.Location.BreweryPostLocationId,
                    CityId: brewery.Location.CityId,
                    CityName: brewery.Location.City?.CityName ?? string.Empty,
                    StateProvinceName: brewery.Location.City?.StateProvince?.StateProvinceName
                        ?? string.Empty,
                    StateProvinceCode: brewery.Location.City?.StateProvince?.ISO3166_2
                        ?? string.Empty,
                    CountryName: brewery.Location.City?.StateProvince?.Country?.CountryName
                        ?? string.Empty,
                    CountryCode: brewery.Location.City?.StateProvince?.Country?.ISO3166_1
                        ?? string.Empty,
                    AddressLine1: brewery.Location.AddressLine1,
                    AddressLine2: brewery.Location.AddressLine2,
                    PostalCode: brewery.Location.PostalCode,
                    Coordinates: brewery.Location.Coordinates
                ),
            BeerPosts:
            [
                .. brewery.BeerPosts.Select(beer => new BeerPreviewDto(
                    BeerPostId: beer.BeerPostId,
                    Name: beer.Name,
                    ABV: beer.ABV,
                    IBU: beer.IBU
                )),
            ]
        );
    }
}
