using Domain.Exceptions;
using Features.Auth.Dtos;
using Features.Auth.Identity;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Features.Auth.Commands.Account.UpdatePassword;

/// <summary>
///     Handles <see cref="UpdatePasswordCommand" /> via <see cref="UserManager{TUser}.ChangePasswordAsync" />,
///     which verifies the current password before hashing and persisting the new one.
/// </summary>
public class UpdatePasswordHandler(UserManager<ApplicationUser> userManager)
    : IRequestHandler<UpdatePasswordCommand, UpdatePasswordPayload>
{
    /// <exception cref="NotFoundException">Thrown when the account does not exist.</exception>
    /// <exception cref="UnauthorizedException">Thrown when the current password does not match.</exception>
    /// <exception cref="ConflictException">Thrown when the update otherwise fails.</exception>
    public async Task<UpdatePasswordPayload> Handle(
        UpdatePasswordCommand request,
        CancellationToken cancellationToken
    )
    {
        ApplicationUser user =
            await userManager.FindByIdAsync(request.UserAccountId.ToString())
            ?? throw new NotFoundException("User account not found");

        IdentityResult result = await userManager.ChangePasswordAsync(
            user,
            request.CurrentPassword,
            request.NewPassword
        );
        if (!result.Succeeded)
        {
            if (result.Errors.Any(e => e.Code == "PasswordMismatch"))
                throw new UnauthorizedException("Current password is incorrect");
            throw new ConflictException(
                string.Join("; ", result.Errors.Select(e => e.Description))
            );
        }

        return new UpdatePasswordPayload(user.Id, DateTime.UtcNow);
    }
}
