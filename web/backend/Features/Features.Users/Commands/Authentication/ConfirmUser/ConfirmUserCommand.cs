using Features.Users.Dtos;
using MediatR;

namespace Features.Users.Commands.Authentication.ConfirmUser;

/// <summary>Validates a confirmation token and confirms the corresponding user account.</summary>
public record ConfirmUserCommand(string Token) : IRequest<ConfirmationPayload>;
