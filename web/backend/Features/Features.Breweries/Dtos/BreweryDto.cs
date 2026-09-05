using Domain.Entities;

namespace Features.Breweries.Dtos;

/// <summary>
///     Represents location data returned for a brewery post.
/// </summary>
/// <param name="Coordinates">
///     Contains the serialized geographic coordinates, when available.
/// </param>
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

/// <summary>
///     Represents a brewery post returned by the API.
/// </summary>
/// <param name="UpdatedAt">
///     Records the most recent update time, if the post has been updated.
/// </param>
/// <param name="RowVersion">
///     Provides the concurrency token required for updates.
/// </param>
/// <param name="Location">
///     Contains the post's location, when one is available.
/// </param>
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

/// <summary>
///     Represents the location-focused result returned by brewery searches.
/// </summary>
/// <param name="DistanceMetres">
///     Contains the distance from the search origin in metres, when applicable.
/// </param>
public record BreweryWithLocationDto(
    Guid BreweryPostId,
    string BreweryName,
    BreweryLocationDto? Location,
    double? DistanceMetres
);
