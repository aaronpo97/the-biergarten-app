using Features.Auth.Dtos;
using MediatR;

namespace Features.Auth.Commands.RefreshToken;

/// <summary>
///     Exchanges a valid refresh token for a new access/refresh token pair. Constructed from the
///     <c>X-Refresh-Token</c> header of <c>POST /api/auth/refresh</c>.
/// </summary>
public record RefreshTokenCommand(string RefreshToken) : IRequest<LoginPayload>;
