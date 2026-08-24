using Domain.Exceptions;
using Features.Auth.Dtos;
using Features.Auth.Identity;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Features.Auth.Commands.UpdateProfile;

/// <summary>
///     Handles <see cref="UpdateProfileCommand" /> via <see cref="UserManager{TUser}" />. First/last name
///     and date of birth aren't tracked by any Identity-specific store interface, so the mutated
///     <see cref="ApplicationUser" /> is saved directly through <see cref="UserManager{TUser}.UpdateAsync" />.
/// </summary>
public class UpdateProfileHandler(UserManager<ApplicationUser> userManager)
    : IRequestHandler<UpdateProfileCommand, UpdateProfilePayload>
{
    /// <exception cref="NotFoundException">Thrown when the account does not exist.</exception>
    /// <exception cref="ConflictException">Thrown when the update otherwise fails.</exception>
    public async Task<UpdateProfilePayload> Handle(
        UpdateProfileCommand request,
        CancellationToken cancellationToken
    )
    {
        ApplicationUser user =
            await userManager.FindByIdAsync(request.UserAccountId.ToString())
            ?? throw new NotFoundException("User account not found");

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.DateOfBirth = request.DateOfBirth;

        IdentityResult result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
            throw new ConflictException(
                string.Join("; ", result.Errors.Select(e => e.Description))
            );

        return new UpdateProfilePayload(user.Id, user.FirstName, user.LastName, user.DateOfBirth);
    }
}
