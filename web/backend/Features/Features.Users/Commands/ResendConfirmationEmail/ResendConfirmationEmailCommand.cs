using MediatR;

namespace Features.Auth.Commands.ResendConfirmationEmail;

/// <summary>Resends the account confirmation email to a user, generating a fresh confirmation token.</summary>
public record ResendConfirmationEmailCommand(Guid UserId) : IRequest;
