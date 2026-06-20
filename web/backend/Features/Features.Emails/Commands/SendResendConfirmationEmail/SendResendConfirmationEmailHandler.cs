using Features.Emails.Services;
using MediatR;
using Shared.Application.Emails;

namespace Features.Emails.Commands.SendResendConfirmationEmail;

/// <summary>
///     Handles <see cref="SendResendConfirmationEmailCommand" />, the cross-slice command sent by Features.Auth
///     when a user requests a fresh confirmation link.
/// </summary>
/// <param name="emailDispatcher">Dispatcher used to render and send the email.</param>
public class SendResendConfirmationEmailHandler(IEmailDispatcher emailDispatcher)
    : IRequestHandler<SendResendConfirmationEmailCommand>
{
    public Task Handle(SendResendConfirmationEmailCommand request, CancellationToken cancellationToken)
    {
        return emailDispatcher.SendResendConfirmationEmailAsync(request.FirstName, request.Email,
            request.ConfirmationToken);
    }
}