using MediatR;

namespace Features.Breweries.Commands.DeleteBrewery;

public record DeleteBreweryCommand(Guid BreweryPostId) : IRequest;
