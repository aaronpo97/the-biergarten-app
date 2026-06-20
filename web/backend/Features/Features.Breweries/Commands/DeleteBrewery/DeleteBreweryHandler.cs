using Features.Breweries.Repository;
using MediatR;

namespace Features.Breweries.Commands.DeleteBrewery;

/// <summary>
/// Handles <see cref="DeleteBreweryCommand"/> by deleting the matching brewery post.
/// </summary>
/// <param name="repository">Repository used to delete the brewery post.</param>
public class DeleteBreweryHandler(IBreweryRepository repository)
    : IRequestHandler<DeleteBreweryCommand>
{
    public Task Handle(DeleteBreweryCommand request, CancellationToken cancellationToken) =>
        repository.DeleteAsync(request.BreweryPostId);
}
