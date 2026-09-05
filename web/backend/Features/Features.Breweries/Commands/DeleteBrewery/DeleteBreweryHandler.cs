using Features.Breweries.Repository;
using MediatR;

namespace Features.Breweries.Commands.DeleteBrewery;

/// <summary>
///     Processes <see cref="DeleteBreweryCommand" /> requests.
/// </summary>
public class DeleteBreweryHandler(IBreweryRepository repository)
    : IRequestHandler<DeleteBreweryCommand>
{
    /// <summary>
    ///     Confirms that the caller owns the post before deleting it.
    /// </summary>
    /// <exception cref="Domain.Exceptions.NotFoundException">
    ///     Thrown if the brewery post does not exist.
    /// </exception>
    /// <exception cref="Domain.Exceptions.ForbiddenException">
    ///     Thrown if the caller did not create the brewery post.
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
