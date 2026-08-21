using Features.Breweries.Repository;
using MediatR;

namespace Features.Breweries.Commands.DeleteBrewery;

/// <summary>Handles <see cref="DeleteBreweryCommand" /> by deleting the corresponding brewery post.</summary>
public class DeleteBreweryHandler(IBreweryRepository repository)
    : IRequestHandler<DeleteBreweryCommand>
{
    /// <exception cref="Domain.Exceptions.NotFoundException">
    ///     Thrown when no brewery exists with <paramref name="request" />'s <c>BreweryPostId</c>.
    /// </exception>
    public Task Handle(DeleteBreweryCommand request, CancellationToken cancellationToken)
    {
        return repository.DeleteAsync(request.BreweryPostId);
    }
}
