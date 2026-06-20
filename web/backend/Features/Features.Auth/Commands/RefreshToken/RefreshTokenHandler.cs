using Features.Auth.Dtos;
using Features.Auth.Services;
using MediatR;

namespace Features.Auth.Commands.RefreshToken;

/// <summary>
///     Handles <see cref="RefreshTokenCommand" /> by validating the refresh token and issuing a new
///     access/refresh token pair.
/// </summary>
/// <param name="tokenService">Service used to validate and exchange the refresh token.</param>
public class RefreshTokenHandler(ITokenService tokenService)
    : IRequestHandler<RefreshTokenCommand, LoginPayload>
{
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
