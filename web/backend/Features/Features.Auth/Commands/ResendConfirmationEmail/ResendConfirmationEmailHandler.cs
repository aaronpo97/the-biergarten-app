using Domain.Entities;
using Features.Auth.Repository;
using Features.Auth.Services;
using MediatR;
using Shared.Application.Emails;

namespace Features.Auth.Commands.ResendConfirmationEmail;

/// <summary>
///     Handles <see cref="ResendConfirmationEmailCommand" /> by generating a fresh confirmation token and
///     sending it via Features.Emails.
/// </summary>
/// <remarks>
///     Returns silently without sending an email if the user does not exist (to prevent user enumeration)
///     or if the user's account is already verified.
/// </remarks>
public class ResendConfirmationEmailHandler(
    IAuthRepository authRepository,
    ITokenService tokenService,
    IMediator mediator
) : IRequestHandler<ResendConfirmationEmailCommand>
{
    public async Task Handle(
        ResendConfirmationEmailCommand request,
        CancellationToken cancellationToken
    )
    {
        UserAccount? user = await authRepository.GetUserByIdAsync(request.UserId);
        if (user == null)
            return; // Silent return to prevent user enumeration

        if (await authRepository.IsUserVerifiedAsync(request.UserId))
            return; // Already confirmed, no-op

        string confirmationToken = tokenService.GenerateConfirmationToken(
            user.UserAccountId,
            user.Username
        );
        await mediator.Send(
            new SendResendConfirmationEmailCommand(user.FirstName, user.Email, confirmationToken),
            cancellationToken
        );
    }
}
