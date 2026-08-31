using Features.Auth.Repository;
using MediatR;

namespace Features.Auth.Commands.Profile.CreateUserProfile;

/// <summary>Handles <see cref="CreateUserProfileCommand" /> by inserting the new profile record.</summary>
public class CreateUserProfileHandler(IUserProfileRepository userProfileRepository)
    : IRequestHandler<CreateUserProfileCommand, Guid>
{
    public Task<Guid> Handle(
        CreateUserProfileCommand request,
        CancellationToken cancellationToken
    ) =>
        userProfileRepository.CreateProfileAsync(
            request.UserAccountId,
            request.Biography,
            cancellationToken
        );
}
