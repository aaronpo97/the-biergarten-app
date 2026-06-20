using Features.Breweries.Dtos;
using MediatR;

namespace Features.Breweries.Queries.GetAllBreweries;

/// <summary>
/// Retrieves a paginated list of brewery posts.
/// </summary>
public record GetAllBreweriesQuery(int? Limit, int? Offset) : IRequest<IEnumerable<BreweryDto>>;
