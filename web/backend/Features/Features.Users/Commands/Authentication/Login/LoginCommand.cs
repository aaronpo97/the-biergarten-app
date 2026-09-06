using Features.Users.Dtos;
using MediatR;

namespace Features.Users.Commands.Authentication.Login;

/// <summary>
///     Authenticates a user using their username and password and issues new tokens. Bound directly
///     from the request body of <c>POST /api/auth/login</c>.
/// </summary>
public record LoginCommand(string Username, string Password) : IRequest<LoginPayload>;
