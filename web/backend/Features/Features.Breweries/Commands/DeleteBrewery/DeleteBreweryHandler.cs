using Domain.Exceptions;
using Domain.Entities;
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
    /// <exception cref="Domain.Exceptions.ForbiddenException">
    ///     Thrown when <paramref name="request" />'s <c>RequestingUserId</c> did not post the brewery.
    /// </exception>
    public async Task Handle(DeleteBreweryCommand request, CancellationToken cancellationToken)
    {
        BreweryPost brewery = await repository.GetByIdAsync(request.BreweryPostId, cancellationToken)
                              ?? throw new NotFoundException($"Brewery with ID {request.BreweryPostId} not found.");

        if (brewery.PostedById != request.RequestingUserId)
            throw new ForbiddenException("You are not authorized to delete this brewery.");

        await repository.DeleteAsync(request.BreweryPostId);
    }
}
