using MediatR;

namespace Features.Breweries.Commands.DeleteBrewery;

/// <summary>
///     Represents a request to delete a brewery post on behalf of a caller.
/// </summary>
public record DeleteBreweryCommand(Guid BreweryPostId, Guid RequestingUserId) : IRequest;
