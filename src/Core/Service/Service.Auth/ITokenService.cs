using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Domain.Entities;
using Domain.Exceptions;
using Infrastructure.Jwt;
using Infrastructure.Repository.Auth;

namespace Service.Auth;

public enum TokenType
{
    AccessToken,
    RefreshToken,
    ConfirmationToken,
}

public record ValidatedToken(Guid UserId, string Username, ClaimsPrincipal Principal);

public record RefreshTokenResult(
    UserAccount UserAccount,
    string RefreshToken,
    string AccessToken
);

public static class TokenServiceExpirationHours
{
    public const double AccessTokenHours = 1;
    public const double RefreshTokenHours = 504; // 21 days
    public const double ConfirmationTokenHours = 0.5; // 30 minutes
}

public interface ITokenService
{
    string GenerateAccessToken(UserAccount user);
    string GenerateRefreshToken(UserAccount user);
    string GenerateConfirmationToken(UserAccount user);
    string GenerateToken<T>(UserAccount user) where T : struct, Enum;
    Task<ValidatedToken> ValidateAccessTokenAsync(string token);
    Task<ValidatedToken> ValidateRefreshTokenAsync(string token);
    Task<ValidatedToken> ValidateConfirmationTokenAsync(string token);
    Task<RefreshTokenResult> RefreshTokenAsync(string refreshTokenString);
}

public class TokenService : ITokenService
{
    private readonly ITokenInfrastructure _tokenInfrastructure;
    private readonly IAuthRepository _authRepository;

    private readonly string _accessTokenSecret;
    private readonly string _refreshTokenSecret;
    private readonly string _confirmationTokenSecret;

    public TokenService(
        ITokenInfrastructure tokenInfrastructure,
        IAuthRepository authRepository
    )
    {
        _tokenInfrastructure = tokenInfrastructure;
        _authRepository = authRepository;

        _accessTokenSecret = Environment.GetEnvironmentVariable("ACCESS_TOKEN_SECRET")
            ?? throw new InvalidOperationException("ACCESS_TOKEN_SECRET environment variable is not set");

        _refreshTokenSecret = Environment.GetEnvironmentVariable("REFRESH_TOKEN_SECRET")
            ?? throw new InvalidOperationException("REFRESH_TOKEN_SECRET environment variable is not set");

        _confirmationTokenSecret = Environment.GetEnvironmentVariable("CONFIRMATION_TOKEN_SECRET")
            ?? throw new InvalidOperationException("CONFIRMATION_TOKEN_SECRET environment variable is not set");
    }

    public string GenerateAccessToken(UserAccount user)
    {
        var expiresAt = DateTime.UtcNow.AddHours(TokenServiceExpirationHours.AccessTokenHours);
        return _tokenInfrastructure.GenerateJwt(user.UserAccountId, user.Username, expiresAt, _accessTokenSecret);
    }

    public string GenerateRefreshToken(UserAccount user)
    {
        var expiresAt = DateTime.UtcNow.AddHours(TokenServiceExpirationHours.RefreshTokenHours);
        return _tokenInfrastructure.GenerateJwt(user.UserAccountId, user.Username, expiresAt, _refreshTokenSecret);
    }

    public string GenerateConfirmationToken(UserAccount user)
    {
        var expiresAt = DateTime.UtcNow.AddHours(TokenServiceExpirationHours.ConfirmationTokenHours);
        return _tokenInfrastructure.GenerateJwt(user.UserAccountId, user.Username, expiresAt, _confirmationTokenSecret);
    }

    public string GenerateToken<T>(UserAccount user) where T : struct, Enum
    {
        if (typeof(T) != typeof(TokenType))
            throw new InvalidOperationException("Invalid token type");

        var tokenTypeName = typeof(T).Name;
        if (!Enum.TryParse(typeof(TokenType), tokenTypeName, out var parsed))
            throw new InvalidOperationException("Invalid token type");

        var tokenType = (TokenType)parsed;
        return tokenType switch
        {
            TokenType.AccessToken => GenerateAccessToken(user),
            TokenType.RefreshToken => GenerateRefreshToken(user),
            TokenType.ConfirmationToken => GenerateConfirmationToken(user),
            _ => throw new InvalidOperationException("Invalid token type"),
        };
    }

    public async Task<ValidatedToken> ValidateAccessTokenAsync(string token)
        => await ValidateTokenInternalAsync(token, _accessTokenSecret, "access");

    public async Task<ValidatedToken> ValidateRefreshTokenAsync(string token)
        => await ValidateTokenInternalAsync(token, _refreshTokenSecret, "refresh");

    public async Task<ValidatedToken> ValidateConfirmationTokenAsync(string token)
        => await ValidateTokenInternalAsync(token, _confirmationTokenSecret, "confirmation");

    private async Task<ValidatedToken> ValidateTokenInternalAsync(string token, string secret, string tokenType)
    {
        try
        {
            var principal = await _tokenInfrastructure.ValidateJwtAsync(token, secret);

            var userIdClaim = principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            var usernameClaim = principal.FindFirst(JwtRegisteredClaimNames.UniqueName)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(usernameClaim))
                throw new UnauthorizedException($"Invalid {tokenType} token: missing required claims");

            if (!Guid.TryParse(userIdClaim, out var userId))
                throw new UnauthorizedException($"Invalid {tokenType} token: malformed user ID");

            return new ValidatedToken(userId, usernameClaim, principal);
        }
        catch (UnauthorizedException)
        {
            throw;
        }
        catch (Exception e)
        {
            throw new UnauthorizedException($"Failed to validate {tokenType} token: {e.Message}");
        }
    }

    public async Task<RefreshTokenResult> RefreshTokenAsync(string refreshTokenString)
    {
        var validated = await ValidateRefreshTokenAsync(refreshTokenString);
        var user = await _authRepository.GetUserByIdAsync(validated.UserId);
        if (user == null)
            throw new UnauthorizedException("User account not found");

        var newAccess = GenerateAccessToken(user);
        var newRefresh = GenerateRefreshToken(user);

        return new RefreshTokenResult(user, newRefresh, newAccess);
    }
}
