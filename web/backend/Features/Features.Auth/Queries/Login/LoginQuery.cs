using Features.Auth.Dtos;
using MediatR;

namespace Features.Auth.Queries.Login;

/// <summary>
///     Authenticates a user using their username and password and issues new tokens. Bound directly
///     from the request body of <c>POST /api/auth/login</c>.
/// </summary>
public record LoginQuery(string Username, string Password) : IRequest<LoginPayload>;
