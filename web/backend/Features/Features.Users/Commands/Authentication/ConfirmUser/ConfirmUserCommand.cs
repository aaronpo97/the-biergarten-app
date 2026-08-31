using Features.Auth.Dtos;
using MediatR;

namespace Features.Auth.Commands.Authentication.ConfirmUser;

/// <summary>Validates a confirmation token and confirms the corresponding user account.</summary>
public record ConfirmUserCommand(string Token) : IRequest<ConfirmationPayload>;
