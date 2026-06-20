using MediatR;

namespace Features.Auth.Commands.ResendConfirmationEmail;

/// <summary>
///     Resends the account confirmation email to a user, generating a fresh confirmation token.
/// </summary>
/// <param name="UserId">The unique identifier of the user requesting the resend.</param>
public record ResendConfirmationEmailCommand(Guid UserId) : IRequest;