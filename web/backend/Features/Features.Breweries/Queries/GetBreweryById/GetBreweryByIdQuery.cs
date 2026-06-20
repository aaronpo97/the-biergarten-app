using Features.Breweries.Dtos;
using MediatR;

namespace Features.Breweries.Queries.GetBreweryById;

/// <summary>
/// Retrieves a single brewery post by its unique identifier.
/// </summary>
public record GetBreweryByIdQuery(Guid BreweryPostId) : IRequest<BreweryDto?>;
