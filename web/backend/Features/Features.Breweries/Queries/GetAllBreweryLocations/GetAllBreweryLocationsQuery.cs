using Features.Breweries.Dtos;
using MediatR;

namespace Features.Breweries.Queries.GetAllBreweryLocations;

/// <summary>
///     Requests brewery posts that include a location.
/// </summary>
public record GetAllBreweryLocationsQuery : IRequest<IEnumerable<BreweryWithLocationDto>>;
