using Features.Auth.Repository;
using MediatR;

namespace Features.Auth.Commands.Profile.UpdateBiography;

/// <summary>Handles <see cref="UpdateBiographyCommand" /> by updating the stored biography.</summary>
public class UpdateBiographyHandler(IUserProfileRepository userProfileRepository)
    : IRequestHandler<UpdateBiographyCommand>
{
    /// <exception cref="Domain.Exceptions.NotFoundException">
    ///     Thrown when no user profile exists for the given user account.
    /// </exception>
    public Task Handle(UpdateBiographyCommand request, CancellationToken cancellationToken) =>
        userProfileRepository.UpdateBiographyAsync(
            request.UserAccountId,
            request.Biography,
            cancellationToken
        );
}
