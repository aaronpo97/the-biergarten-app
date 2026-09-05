using Features.Breweries.Dtos;
using MediatR;

namespace Features.Breweries.Queries.GetBreweryById;

/// <summary>
///     Requests a brewery post by its identifier.
/// </summary>
/// <remarks>
///     The handler returns <see langword="null" /> when the post is absent.
/// </remarks>
public record GetBreweryByIdQuery(Guid BreweryPostId) : IRequest<BreweryDto?>;
