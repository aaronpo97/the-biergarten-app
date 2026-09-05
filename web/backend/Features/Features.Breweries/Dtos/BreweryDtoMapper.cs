using Domain.Entities;

namespace Features.Breweries.Dtos;

/// <summary>
///     Converts brewery domain entities into API response models.
/// </summary>
public static class BreweryDtoMapper
{
    /// <summary>
    ///     Converts a brewery post into its complete API representation.
    /// </summary>
    public static BreweryDto ToDto(this BreweryPost brewery) =>
        new(
            brewery.BreweryPostId,
            brewery.PostedById,
            brewery.BreweryName,
            brewery.Description,
            brewery.CreatedAt,
            brewery.UpdatedAt,
            brewery.RowVersion,
            brewery.Location is null
                ? null
                : new BreweryLocationDto(
                    brewery.Location.BreweryPostLocationId,
                    brewery.Location.CityId,
                    brewery.Location.City?.CityName ?? string.Empty,
                    brewery.Location.City?.StateProvince?.StateProvinceName ?? string.Empty,
                    brewery.Location.City?.StateProvince?.Iso31662 ?? string.Empty,
                    brewery.Location.City?.StateProvince?.Country?.CountryName ?? string.Empty,
                    brewery.Location.City?.StateProvince?.Country?.Iso31661 ?? string.Empty,
                    brewery.Location.AddressLine1,
                    brewery.Location.AddressLine2,
                    brewery.Location.PostalCode,
                    brewery.Location.Coordinates
                )
        );

    /// <summary>
    ///     Converts a brewery post into its location-search representation.
    /// </summary>
    public static BreweryWithLocationDto ToSimplifiedDto(this BreweryPost brewery) =>
        new(
            brewery.BreweryPostId,
            brewery.BreweryName,
            brewery.Location is null
                ? null
                : new BreweryLocationDto(
                    brewery.Location.BreweryPostLocationId,
                    brewery.Location.CityId,
                    brewery.Location.City?.CityName ?? string.Empty,
                    brewery.Location.City?.StateProvince?.StateProvinceName ?? string.Empty,
                    brewery.Location.City?.StateProvince?.Iso31662 ?? string.Empty,
                    brewery.Location.City?.StateProvince?.Country?.CountryName ?? string.Empty,
                    brewery.Location.City?.StateProvince?.Country?.Iso31661 ?? string.Empty,
                    brewery.Location.AddressLine1,
                    brewery.Location.AddressLine2,
                    brewery.Location.PostalCode,
                    brewery.Location.Coordinates
                ),
            brewery.Distance?.DistanceMetres
        );
}
