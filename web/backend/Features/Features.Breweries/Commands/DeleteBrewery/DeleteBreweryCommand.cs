using MediatR;

namespace Features.Breweries.Commands.DeleteBrewery;

/// <summary>Deletes a brewery post. Bound directly from the route of <c>DELETE /api/brewery/{id}</c>.</summary>
public record DeleteBreweryCommand(Guid BreweryPostId) : IRequest;
