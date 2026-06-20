using Features.Emails.Services;
using MediatR;
using Shared.Application.Emails;

namespace Features.Emails.Commands.SendRegistrationEmail;

/// <summary>
///     Handles <see cref="SendRegistrationEmailCommand" />, the cross-slice command sent by Features.Auth
///     after a new user registers.
/// </summary>
/// <param name="emailDispatcher">Dispatcher used to render and send the email.</param>
public class SendRegistrationEmailHandler(IEmailDispatcher emailDispatcher)
    : IRequestHandler<SendRegistrationEmailCommand>
{
    public Task Handle(SendRegistrationEmailCommand request, CancellationToken cancellationToken)
    {
        return emailDispatcher.SendRegistrationEmailAsync(
            request.FirstName,
            request.Email,
            request.ConfirmationToken
        );
    }
}
