using Domain.Entities;
using Infrastructure.Jwt;

namespace Service.Auth;

public interface ITokenService
{
    public string GenerateAccessToken(UserAccount user);
    public string GenerateRefreshToken(UserAccount user);
    public string GenerateConfirmationToken(UserAccount user);
}

public static class TokenServiceExpirationHours
{
    public const double AccessTokenHours = 1;
    public const double RefreshTokenHours = 504; // 21 days
    public const double ConfirmationTokenHours = 0.5; // 30 minutes
}

public class TokenService(ITokenInfrastructure tokenInfrastructure)
    : ITokenService
{
    private readonly string _accessTokenSecret =
        Environment.GetEnvironmentVariable("ACCESS_TOKEN_SECRET")
        ?? throw new InvalidOperationException(
            "ACCESS_TOKEN_SECRET environment variable is not set"
        );

    private readonly string _refreshTokenSecret =
        Environment.GetEnvironmentVariable("REFRESH_TOKEN_SECRET")
        ?? throw new InvalidOperationException(
            "REFRESH_TOKEN_SECRET environment variable is not set"
        );

    private readonly string _confirmationTokenSecret =
        Environment.GetEnvironmentVariable("CONFIRMATION_TOKEN_SECRET")
        ?? throw new InvalidOperationException(
            "CONFIRMATION_TOKEN_SECRET environment variable is not set"
        );

    public string GenerateAccessToken(UserAccount userAccount)
    {
        var jwtExpiresAt = DateTime.UtcNow.AddHours(
            TokenServiceExpirationHours.AccessTokenHours
        );
        return tokenInfrastructure.GenerateJwt(
            userAccount.UserAccountId,
            userAccount.Username,
            jwtExpiresAt,
            _accessTokenSecret
        );
    }

    public string GenerateRefreshToken(UserAccount userAccount)
    {
        var jwtExpiresAt = DateTime.UtcNow.AddHours(
            TokenServiceExpirationHours.RefreshTokenHours
        );
        return tokenInfrastructure.GenerateJwt(
            userAccount.UserAccountId,
            userAccount.Username,
            jwtExpiresAt,
            _refreshTokenSecret
        );
    }

    public string GenerateConfirmationToken(UserAccount userAccount)
    {
        var jwtExpiresAt = DateTime.UtcNow.AddHours(
            TokenServiceExpirationHours.ConfirmationTokenHours
        );
        return tokenInfrastructure.GenerateJwt(
            userAccount.UserAccountId,
            userAccount.Username,
            jwtExpiresAt,
            _confirmationTokenSecret
        );
    }
}
