using Features.Auth.Dtos;
using MediatR;

namespace Features.Auth.Commands.ConfirmUser;

/// <summary>
/// Validates a confirmation token and confirms the corresponding user account.
/// </summary>
/// <param name="Token">The confirmation token issued to the user, typically delivered via email.</param>
public record ConfirmUserCommand(string Token) : IRequest<ConfirmationPayload>;
