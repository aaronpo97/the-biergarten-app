using Features.Breweries.Dtos;
using MediatR;

namespace Features.Breweries.Queries.GetBreweryLocationsWithinRange;

/// <summary>
///     Requests located brewery posts near a geographic point, nearest first.
/// </summary>
/// <param name="Latitude">
///     Sets the origin latitude in decimal degrees.
/// </param>
/// <param name="Longitude">
///     Sets the origin longitude in decimal degrees.
/// </param>
/// <param name="RangeInMetres">
///     Sets the inclusive search radius in metres.
/// </param>
public record GetBreweryLocationsWithinRangeQuery(
    double Latitude,
    double Longitude,
    double RangeInMetres
) : IRequest<IEnumerable<BreweryWithLocationDto>>;
