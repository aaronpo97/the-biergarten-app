using System.Security.Claims;
using Domain.Entities;

namespace Features.Auth.Services;

/// <summary>
///     Identifies the kind of token being generated or validated.
/// </summary>
public enum TokenType
{
    /// <summary>A short-lived token used to authorize API requests.</summary>
    AccessToken,

    /// <summary>A long-lived token used to obtain new access tokens.</summary>
    RefreshToken,

    /// <summary>A short-lived token used to confirm a user's email/account.</summary>
    ConfirmationToken,
}

/// <summary>Represents the result of successfully validating a token.</summary>
public record ValidatedToken(Guid UserId, string Username, ClaimsPrincipal Principal);

/// <summary>Represents the result of refreshing a user's session.</summary>
public record RefreshTokenResult(UserAccount UserAccount, string RefreshToken, string AccessToken);

/// <summary>
///     Defines the expiration windows, in hours, for each type of token issued by <see cref="ITokenService" />.
/// </summary>
public static class TokenServiceExpirationHours
{
    public const double AccessTokenHours = 1;

    /// <summary>21 days.</summary>
    public const double RefreshTokenHours = 504;

    /// <summary>30 minutes.</summary>
    public const double ConfirmationTokenHours = 0.5;
}

/// <summary>
///     Defines operations for generating and validating JWTs used for access, refresh, and account confirmation.
/// </summary>
public interface ITokenService
{
    string GenerateAccessToken(UserAccount user);

    string GenerateRefreshToken(UserAccount user);

    string GenerateConfirmationToken(UserAccount user);

    /// <summary>Generates a token of the type specified by <typeparamref name="T" />.</summary>
    /// <typeparam name="T">Must be <see cref="TokenType" />.</typeparam>
    string GenerateToken<T>(UserAccount user)
        where T : struct, Enum;

    Task<ValidatedToken> ValidateAccessTokenAsync(string token);

    Task<ValidatedToken> ValidateRefreshTokenAsync(string token);

    Task<ValidatedToken> ValidateConfirmationTokenAsync(string token);

    /// <summary>Validates a refresh token and issues a new access/refresh token pair for the associated user.</summary>
    Task<RefreshTokenResult> RefreshTokenAsync(string refreshTokenString);
}
