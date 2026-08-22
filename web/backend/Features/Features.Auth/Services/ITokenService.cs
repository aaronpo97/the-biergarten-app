using System.Security.Claims;

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
public record RefreshTokenResult(Guid UserId, string Username, string RefreshToken, string AccessToken);

/// <summary>
///     Defines the expiration windows, in hours, for each type of token issued by <see cref="ITokenService" />.
/// </summary>
public static class TokenServiceExpirationHours
{
    /// <summary>1 hour.</summary>
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
    /// <summary>
    ///     Generates a signed access token for the given user, expiring after
    ///     <see cref="TokenServiceExpirationHours.AccessTokenHours" /> hours.
    /// </summary>
    string GenerateAccessToken(Guid userId, string username);

    /// <summary>
    ///     Generates a signed refresh token for the given user, expiring after
    ///     <see cref="TokenServiceExpirationHours.RefreshTokenHours" /> hours.
    /// </summary>
    string GenerateRefreshToken(Guid userId, string username);

    /// <summary>
    ///     Generates a signed confirmation token for the given user, expiring after
    ///     <see cref="TokenServiceExpirationHours.ConfirmationTokenHours" /> hours.
    /// </summary>
    string GenerateConfirmationToken(Guid userId, string username);


    /// <summary>Validates an access token's signature and expiration and extracts the caller's identity.</summary>
    /// <exception cref="Domain.Exceptions.UnauthorizedException">
    ///     Thrown when the token is missing required claims, has a malformed user ID, or otherwise fails validation.
    /// </exception>
    Task<ValidatedToken> ValidateAccessTokenAsync(string token);

    /// <summary>Validates a refresh token's signature and expiration and extracts the caller's identity.</summary>
    /// <exception cref="Domain.Exceptions.UnauthorizedException">
    ///     Thrown when the token is missing required claims, has a malformed user ID, or otherwise fails validation.
    /// </exception>
    Task<ValidatedToken> ValidateRefreshTokenAsync(string token);

    /// <summary>Validates a confirmation token's signature and expiration and extracts the caller's identity.</summary>
    /// <exception cref="Domain.Exceptions.UnauthorizedException">
    ///     Thrown when the token is missing required claims, has a malformed user ID, or otherwise fails validation.
    /// </exception>
    Task<ValidatedToken> ValidateConfirmationTokenAsync(string token);

    /// <summary>Validates a refresh token and issues a new access/refresh token pair for the associated user.</summary>
    /// <exception cref="Domain.Exceptions.UnauthorizedException">
    ///     Thrown when the refresh token is invalid or expired, or when the user account it refers to no
    ///     longer exists.
    /// </exception>
    Task<RefreshTokenResult> RefreshTokenAsync(string refreshTokenString);
}
