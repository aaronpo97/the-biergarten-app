using System.Security.Claims;
using Domain.Entities;

namespace Features.Auth.Services;

/// <summary>
/// Identifies the kind of token being generated or validated.
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

/// <summary>
/// Represents the result of successfully validating a token.
/// </summary>
/// <param name="UserId">The unique identifier of the user the token belongs to.</param>
/// <param name="Username">The username extracted from the token's claims.</param>
/// <param name="Principal">The <see cref="ClaimsPrincipal"/> produced from the validated token.</param>
public record ValidatedToken(Guid UserId, string Username, ClaimsPrincipal Principal);

/// <summary>
/// Represents the result of refreshing a user's session.
/// </summary>
/// <param name="UserAccount">The user account associated with the refreshed session.</param>
/// <param name="RefreshToken">The newly issued refresh token.</param>
/// <param name="AccessToken">The newly issued access token.</param>
public record RefreshTokenResult(
    UserAccount UserAccount,
    string RefreshToken,
    string AccessToken
);

/// <summary>
/// Defines the expiration windows, in hours, for each type of token issued by <see cref="ITokenService"/>.
/// </summary>
public static class TokenServiceExpirationHours
{
    /// <summary>The expiration window, in hours, for access tokens.</summary>
    public const double AccessTokenHours = 1;
    /// <summary>The expiration window, in hours, for refresh tokens (21 days).</summary>
    public const double RefreshTokenHours = 504; // 21 days
    /// <summary>The expiration window, in hours, for confirmation tokens (30 minutes).</summary>
    public const double ConfirmationTokenHours = 0.5; // 30 minutes
}

/// <summary>
/// Defines operations for generating and validating JWTs used for access, refresh, and account confirmation.
/// </summary>
public interface ITokenService
{
    /// <summary>
    /// Generates a new access token for the given user.
    /// </summary>
    /// <param name="user">The user account to generate the token for.</param>
    /// <returns>The signed access token string.</returns>
    string GenerateAccessToken(UserAccount user);

    /// <summary>
    /// Generates a new refresh token for the given user.
    /// </summary>
    /// <param name="user">The user account to generate the token for.</param>
    /// <returns>The signed refresh token string.</returns>
    string GenerateRefreshToken(UserAccount user);

    /// <summary>
    /// Generates a new confirmation token for the given user.
    /// </summary>
    /// <param name="user">The user account to generate the token for.</param>
    /// <returns>The signed confirmation token string.</returns>
    string GenerateConfirmationToken(UserAccount user);

    /// <summary>
    /// Generates a token of the type specified by <typeparamref name="T"/>, which must be <see cref="TokenType"/>.
    /// </summary>
    /// <typeparam name="T">The enum type identifying which kind of token to generate. Must be <see cref="TokenType"/>.</typeparam>
    /// <param name="user">The user account to generate the token for.</param>
    /// <returns>The signed token string corresponding to the requested token type.</returns>
    string GenerateToken<T>(UserAccount user) where T : struct, Enum;

    /// <summary>
    /// Validates an access token.
    /// </summary>
    /// <param name="token">The access token string to validate.</param>
    /// <returns>A <see cref="ValidatedToken"/> describing the token's claims.</returns>
    Task<ValidatedToken> ValidateAccessTokenAsync(string token);

    /// <summary>
    /// Validates a refresh token.
    /// </summary>
    /// <param name="token">The refresh token string to validate.</param>
    /// <returns>A <see cref="ValidatedToken"/> describing the token's claims.</returns>
    Task<ValidatedToken> ValidateRefreshTokenAsync(string token);

    /// <summary>
    /// Validates a confirmation token.
    /// </summary>
    /// <param name="token">The confirmation token string to validate.</param>
    /// <returns>A <see cref="ValidatedToken"/> describing the token's claims.</returns>
    Task<ValidatedToken> ValidateConfirmationTokenAsync(string token);

    /// <summary>
    /// Validates a refresh token and issues a new access/refresh token pair for the associated user.
    /// </summary>
    /// <param name="refreshTokenString">The refresh token string to validate and exchange.</param>
    /// <returns>A <see cref="RefreshTokenResult"/> containing the user and newly issued tokens.</returns>
    Task<RefreshTokenResult> RefreshTokenAsync(string refreshTokenString);
}
