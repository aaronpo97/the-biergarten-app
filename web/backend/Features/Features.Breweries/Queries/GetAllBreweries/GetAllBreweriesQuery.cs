using Features.Breweries.Dtos;
using MediatR;

namespace Features.Breweries.Queries.GetAllBreweries;

/// <summary>Retrieves brewery posts, newest first. Bound directly from the query string of <c>GET /api/brewery</c>.</summary>
/// <param name="Limit">Maximum number of breweries to return. Unbounded if <see langword="null"/>.</param>
/// <param name="Offset">Number of breweries to skip. Treated as zero if <see langword="null"/>.</param>
public record GetAllBreweriesQuery(int? Limit, int? Offset) : IRequest<IEnumerable<BreweryDto>>;
