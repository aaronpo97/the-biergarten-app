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
                    StateProvinceCode: brewery.Location.City?.StateProvince?.Iso31662
                        ?? string.Empty,
                    CountryName: brewery.Location.City?.StateProvince?.Country?.CountryName
                        ?? string.Empty,
                    CountryCode: brewery.Location.City?.StateProvince?.Country?.Iso31661
                        ?? string.Empty,
                    AddressLine1: brewery.Location.AddressLine1,
                    AddressLine2: brewery.Location.AddressLine2,
                    PostalCode: brewery.Location.PostalCode,
                    Coordinates: brewery.Location.Coordinates
                )
        );
    }
}
