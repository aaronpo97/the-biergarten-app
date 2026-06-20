using MediatR;

namespace Features.Breweries.Commands.DeleteBrewery;

/// <summary>
/// Deletes a brewery post by its unique identifier.
/// </summary>
public record DeleteBreweryCommand(Guid BreweryPostId) : IRequest;
