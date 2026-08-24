using Domain.Exceptions;
using Features.Auth.Dtos;
using Features.Auth.Identity;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Features.Auth.Commands.UpdateEmail;

/// <summary>
///     Handles <see cref="UpdateEmailCommand" /> via <see cref="UserManager{TUser}" />.
///     <see cref="UserManager{TUser}.SetEmailAsync" /> also resets <c>EmailConfirmed</c> to
///     <see langword="false" />, so the user must re-confirm the new address (see
///     <c>Features.Auth.Commands.ResendConfirmationEmail</c>).
/// </summary>
public class UpdateEmailHandler(UserManager<ApplicationUser> userManager)
    : IRequestHandler<UpdateEmailCommand, UpdateEmailPayload>
{
    /// <exception cref="NotFoundException">Thrown when the account does not exist.</exception>
    /// <exception cref="ConflictException">Thrown when the requested email address is already in use.</exception>
    public async Task<UpdateEmailPayload> Handle(
        UpdateEmailCommand request,
        CancellationToken cancellationToken
    )
    {
        ApplicationUser user =
            await userManager.FindByIdAsync(request.UserAccountId.ToString())
            ?? throw new NotFoundException("User account not found");

        IdentityResult result = await userManager.SetEmailAsync(user, request.NewEmail);
        if (!result.Succeeded)
        {
            if (result.Errors.Any(e => e.Code == "DuplicateEmail"))
                throw new ConflictException("Email address already exists");
            throw new ConflictException(
                string.Join("; ", result.Errors.Select(e => e.Description))
            );
        }

        return new UpdateEmailPayload(user.Id, user.Email, user.EmailConfirmed);
    }
}
