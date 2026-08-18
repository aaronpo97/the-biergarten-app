using Features.Breweries.Dtos;
using MediatR;

namespace Features.Breweries.Queries.GetBreweryById;

/// <summary>Retrieves a brewery post by ID. Bound directly from the route of <c>GET /api/brewery/{id}</c>.</summary>
/// <remarks>Yields <see langword="null"/> if no brewery exists with the given <c>BreweryPostId</c>.</remarks>
public record GetBreweryByIdQuery(Guid BreweryPostId) : IRequest<BreweryDto?>;
