using Domain.Exceptions;
using Features.Auth.Dtos;
using Features.Auth.Identity;
using Features.Auth.Services;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Features.Auth.Commands.Authentication.ConfirmUser;

/// <summary>
///     Handles <see cref="ConfirmUserCommand" /> by validating the confirmation token and marking the
///     corresponding user account as confirmed.
/// </summary>
public class ConfirmUserHandler(
    UserManager<ApplicationUser> userManager,
    IUserEmailStore<ApplicationUser> emailStore,
    ITokenService tokenService
) : IRequestHandler<ConfirmUserCommand, ConfirmationPayload>
{
    /// <exception cref="UnauthorizedException">
    ///     Thrown when the confirmation token is invalid or expired, or when the associated user account cannot be found.
    /// </exception>
    public async Task<ConfirmationPayload> Handle(
        ConfirmUserCommand request,
        CancellationToken cancellationToken
    )
    {
        ValidatedToken validatedToken = await tokenService.ValidateConfirmationTokenAsync(
            request.Token
        );

        ApplicationUser? user = await userManager.FindByIdAsync(validatedToken.UserId.ToString());
        if (user == null)
            throw new UnauthorizedException("User account not found");

        await emailStore.SetEmailConfirmedAsync(user, true, cancellationToken);
        await userManager.UpdateAsync(user);

        return new ConfirmationPayload(user.Id, DateTime.UtcNow);
    }
}
