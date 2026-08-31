using Domain.Exceptions;

namespace Features.Breweries.Repository;

/// <summary>Shared ownership check for commands that mutate a specific brewery post.</summary>
public static class BreweryOwnershipExtensions
{
    /// <exception cref="Domain.Exceptions.NotFoundException">Thrown when no brewery exists with the given ID.</exception>
    /// <exception cref="Domain.Exceptions.ForbiddenException">Thrown when <paramref name="requestingUserId" /> did not post the brewery.</exception>
    public static async Task EnsureCallerOwnsBreweryAsync(
        this IBreweryRepository repository,
        Guid breweryPostId,
        Guid requestingUserId,
        CancellationToken cancellationToken
    )
    {
        Guid postedById =
            await repository.GetPostedByIdAsync(breweryPostId, cancellationToken)
            ?? throw new NotFoundException($"Brewery with ID {breweryPostId} not found.");

        if (postedById != requestingUserId)
            throw new ForbiddenException("You are not authorized to modify this brewery.");
    }
}
