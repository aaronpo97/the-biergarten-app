using Features.Auth.Repository;
using Features.Auth.Services;
using MediatR;
using Shared.Application.Emails;

namespace Features.Auth.Commands.ResendConfirmationEmail;

/// <summary>
/// Handles <see cref="ResendConfirmationEmailCommand"/> by generating a fresh confirmation token and
/// sending it via Features.Emails.
/// </summary>
/// <param name="authRepository">Repository used to look up the user and check verification status.</param>
/// <param name="tokenService">Service used to generate the confirmation token.</param>
/// <param name="mediator">Used to send the cross-slice command that triggers the email.</param>
/// <remarks>
/// Returns silently without sending an email if the user does not exist (to prevent user enumeration)
/// or if the user's account is already verified.
/// </remarks>
public class ResendConfirmationEmailHandler(
    IAuthRepository authRepository,
    ITokenService tokenService,
    IMediator mediator
) : IRequestHandler<ResendConfirmationEmailCommand>
{
    public async Task Handle(ResendConfirmationEmailCommand request, CancellationToken cancellationToken)
    {
        var user = await authRepository.GetUserByIdAsync(request.UserId);
        if (user == null)
        {
            return; // Silent return to prevent user enumeration
        }

        if (await authRepository.IsUserVerifiedAsync(request.UserId))
        {
            return; // Already confirmed, no-op
        }

        var confirmationToken = tokenService.GenerateConfirmationToken(user);
        await mediator.Send(
            new SendResendConfirmationEmailCommand(user.FirstName, user.Email, confirmationToken),
            cancellationToken
        );
    }
}
