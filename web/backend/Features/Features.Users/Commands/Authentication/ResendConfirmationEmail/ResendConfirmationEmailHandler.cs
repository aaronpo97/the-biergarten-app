using Features.Users.Identity;
using Features.Users.Notifications;
using Features.Users.Services;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Features.Users.Commands.Authentication.ResendConfirmationEmail;

/// <summary>
///     Handles <see cref="ResendConfirmationEmailCommand" /> by generating a fresh confirmation token and
///     publishing <see cref="ConfirmationEmailResendRequestedNotification" /> for Features.Emails to send it.
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
        await mediator.Publish(
            new ConfirmationEmailResendRequestedNotification(
                user.Id,
                user.FirstName,
                user.Email,
                confirmationToken
            ),
            cancellationToken
        );
    }
}
