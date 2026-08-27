using Domain.Entities;

namespace Features.Breweries.Dtos;

/// <summary>Location details of a brewery, as returned by the API.</summary>
/// <param name="Coordinates">The brewery's geographic coordinates, in a raw binary representation.</param>
public record BreweryLocationDto(
    Guid BreweryPostLocationId,
    Guid CityId,
    string CityName,
    string StateProvinceName,
    string StateProvinceCode,
    string CountryName,
    string CountryCode,
    string AddressLine1,
    string? AddressLine2,
    string PostalCode,
    CoordinateData? Coordinates
);

/// <summary>A brewery post, as returned by the API.</summary>
/// <param name="UpdatedAt">The date and time of the last edit, or <see langword="null"/> if never edited.</param>
/// <param name="RowVersion">The row-version/concurrency token used to detect conflicting concurrent updates.</param>
/// <param name="Location">The brewery's location, or <see langword="null"/> if none has been set.</param>
public record BreweryDto(
    Guid BreweryPostId,
    Guid PostedById,
    string BreweryName,
    string Description,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    byte[]? RowVersion,
    BreweryLocationDto? Location
);
public record SimplifiedBreweryDto(
    Guid BreweryPostId,
    string BreweryName,
    BreweryLocationDto? Location
);
