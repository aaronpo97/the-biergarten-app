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
        await repository.EnsureCallerOwnsBreweryAsync(
            request.BreweryPostId,
            request.RequestingUserId,
            cancellationToken
        );

        await repository.DeleteAsync(request.BreweryPostId);
    }
}
