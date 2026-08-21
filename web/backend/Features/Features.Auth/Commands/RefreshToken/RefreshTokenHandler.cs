using Features.Auth.Dtos;
using Features.Auth.Services;
using MediatR;

namespace Features.Auth.Commands.RefreshToken;

/// <summary>
///     Handles <see cref="RefreshTokenCommand" /> by validating the refresh token and issuing a new
///     access/refresh token pair.
/// </summary>
public class RefreshTokenHandler(ITokenService tokenService)
    : IRequestHandler<RefreshTokenCommand, LoginPayload>
{
    /// <exception cref="Domain.Exceptions.UnauthorizedException">
    ///     Thrown when the refresh token is invalid or expired, or when the user account it refers to no
    ///     longer exists.
    /// </exception>
    public async Task<LoginPayload> Handle(
        RefreshTokenCommand request,
        CancellationToken cancellationToken
    )
    {
        RefreshTokenResult result = await tokenService.RefreshTokenAsync(request.RefreshToken);
        return new LoginPayload(
            result.UserAccount.UserAccountId,
            result.UserAccount.Username,
            result.RefreshToken,
            result.AccessToken
        );
    }
}
