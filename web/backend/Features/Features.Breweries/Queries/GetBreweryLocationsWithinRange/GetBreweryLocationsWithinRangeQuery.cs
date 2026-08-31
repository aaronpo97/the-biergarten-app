using Features.Breweries.Dtos;
using MediatR;

namespace Features.Breweries.Queries.GetBreweryLocationsWithinRange;

/// <summary>
///     Retrieves brewery posts with a set location within <paramref name="RangeInMetres" /> of the given
///     coordinates, nearest first. Bound directly from the query string of
///     <c>GET /api/brewery/locations/nearby</c>.
/// </summary>
/// <param name="Latitude">The origin latitude, in decimal degrees.</param>
/// <param name="Longitude">The origin longitude, in decimal degrees.</param>
/// <param name="RangeInMetres">The maximum distance, in metres, from the origin coordinates.</param>
public record GetBreweryLocationsWithinRangeQuery(double Latitude, double Longitude, double RangeInMetres)
    : IRequest<IEnumerable<BreweryWithLocationDto>>;
