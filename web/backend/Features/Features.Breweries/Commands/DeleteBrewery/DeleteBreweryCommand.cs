using MediatR;

namespace Features.Breweries.Commands.DeleteBrewery;

/// <summary>Deletes a brewery post. <see cref="BreweryPostId" /> is bound from the route of <c>DELETE /api/brewery/{id}</c>.</summary>
public record DeleteBreweryCommand(Guid BreweryPostId, Guid RequestingUserId) : IRequest;
