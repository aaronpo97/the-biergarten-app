using Features.Auth.Identity;
using Features.Auth.Services;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Shared.Application.Emails;

namespace Features.Auth.Commands.Authentication.ResendConfirmationEmail;

/// <summary>
///     Handles <see cref="ResendConfirmationEmailCommand" /> by generating a fresh confirmation token and
///     sending it via Features.Emails.
/// </summary>
/// <remarks>
///     Returns silently without sending an email if the user does not exist (to prevent user enumeration)
///     or if the user's account is already verified.
/// </remarks>
public class ResendConfirmationEmailHandler(
    UserManager<ApplicationUser> userManager,
    ITokenService tokenService,
    IMediator mediator
) : IRequestHandler<ResendConfirmationEmailCommand>
{
    public async Task Handle(
        ResendConfirmationEmailCommand request,
        CancellationToken cancellationToken
    )
    {
        ApplicationUser? user = await userManager.FindByIdAsync(request.UserId.ToString());
        if (user == null)
            return; // Silent return to prevent user enumeration

        if (await userManager.IsEmailConfirmedAsync(user))
            return; // Already confirmed, no-op

        string confirmationToken = tokenService.GenerateConfirmationToken(user.Id, user.UserName);
        await mediator.Send(
            new SendResendConfirmationEmailCommand(user.FirstName, user.Email, confirmationToken),
            cancellationToken
        );
    }
}
