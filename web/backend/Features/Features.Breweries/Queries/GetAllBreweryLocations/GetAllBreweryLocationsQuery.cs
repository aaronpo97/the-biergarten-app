using Features.Breweries.Dtos;
using MediatR;

namespace Features.Breweries.Queries.GetAllBreweryLocations;

/// <summary>
///     Retrieves all brewery posts that have a set location. Bound directly from
///     <c>GET /api/brewery/locations</c>.
/// </summary>
public record GetAllBreweryLocationsQuery : IRequest<IEnumerable<BreweryWithLocationDto>>;
