using Domain.Exceptions;

namespace Features.Breweries.Repository;

/// <summary>
///     Provides authorization checks for brewery-post mutations.
/// </summary>
public static class BreweryOwnershipExtensions
{
    /// <summary>
    ///     Verifies that the specified user created the brewery post.
    /// </summary>
    /// <exception cref="Domain.Exceptions.NotFoundException">
    ///     Thrown if the brewery post cannot be found.
    /// </exception>
    /// <exception cref="Domain.Exceptions.ForbiddenException">
    ///     Thrown if the specified user does not own the brewery post.
    /// </exception>
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
