using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Domain.Entities;
using Domain.Exceptions;
using Infrastructure.Jwt;
using Infrastructure.Repository.Auth;

namespace Service.Auth;

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

/// <summary>
/// Default implementation of <see cref="ITokenService"/> that generates and validates JWTs
/// for access, refresh, and confirmation flows using secrets read from environment variables.
/// </summary>
public class TokenService : ITokenService
{
    private readonly ITokenInfrastructure _tokenInfrastructure;
    private readonly IAuthRepository _authRepository;

    private readonly string _accessTokenSecret;
    private readonly string _refreshTokenSecret;
    private readonly string _confirmationTokenSecret;

    /// <summary>
    /// Initializes a new instance of <see cref="TokenService"/>, loading the access, refresh, and
    /// confirmation token signing secrets from environment variables.
    /// </summary>
    /// <param name="tokenInfrastructure">The infrastructure component used to generate and validate JWTs.</param>
    /// <param name="authRepository">Repository used to look up user accounts during token refresh.</param>
    /// <exception cref="InvalidOperationException">
    /// Thrown when any of the <c>ACCESS_TOKEN_SECRET</c>, <c>REFRESH_TOKEN_SECRET</c>, or
    /// <c>CONFIRMATION_TOKEN_SECRET</c> environment variables are not set.
    /// </exception>
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

    /// <summary>
    /// Generates an access token for the given user, signed with the access token secret and
    /// expiring after <see cref="TokenServiceExpirationHours.AccessTokenHours"/> hours.
    /// </summary>
    /// <param name="user">The user account to generate the token for.</param>
    /// <returns>The signed access token string.</returns>
    public string GenerateAccessToken(UserAccount user)
    {
        var expiresAt = DateTime.UtcNow.AddHours(TokenServiceExpirationHours.AccessTokenHours);
        return _tokenInfrastructure.GenerateJwt(user.UserAccountId, user.Username, expiresAt, _accessTokenSecret);
    }

    /// <summary>
    /// Generates a refresh token for the given user, signed with the refresh token secret and
    /// expiring after <see cref="TokenServiceExpirationHours.RefreshTokenHours"/> hours.
    /// </summary>
    /// <param name="user">The user account to generate the token for.</param>
    /// <returns>The signed refresh token string.</returns>
    public string GenerateRefreshToken(UserAccount user)
    {
        var expiresAt = DateTime.UtcNow.AddHours(TokenServiceExpirationHours.RefreshTokenHours);
        return _tokenInfrastructure.GenerateJwt(user.UserAccountId, user.Username, expiresAt, _refreshTokenSecret);
    }

    /// <summary>
    /// Generates a confirmation token for the given user, signed with the confirmation token secret and
    /// expiring after <see cref="TokenServiceExpirationHours.ConfirmationTokenHours"/> hours.
    /// </summary>
    /// <param name="user">The user account to generate the token for.</param>
    /// <returns>The signed confirmation token string.</returns>
    public string GenerateConfirmationToken(UserAccount user)
    {
        var expiresAt = DateTime.UtcNow.AddHours(TokenServiceExpirationHours.ConfirmationTokenHours);
        return _tokenInfrastructure.GenerateJwt(user.UserAccountId, user.Username, expiresAt, _confirmationTokenSecret);
    }

    /// <summary>
    /// Generates a token of the kind specified by <typeparamref name="T"/>, dispatching to
    /// <see cref="GenerateAccessToken"/>, <see cref="GenerateRefreshToken"/>, or
    /// <see cref="GenerateConfirmationToken"/> based on the corresponding <see cref="TokenType"/> value.
    /// </summary>
    /// <typeparam name="T">The enum type identifying which kind of token to generate. Must be <see cref="TokenType"/>.</typeparam>
    /// <param name="user">The user account to generate the token for.</param>
    /// <returns>The signed token string corresponding to the requested token type.</returns>
    /// <exception cref="InvalidOperationException">
    /// Thrown when <typeparamref name="T"/> is not <see cref="TokenType"/> or does not resolve to a known token type.
    /// </exception>
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

    /// <summary>
    /// Validates an access token against the access token secret.
    /// </summary>
    /// <param name="token">The access token string to validate.</param>
    /// <returns>A <see cref="ValidatedToken"/> describing the token's claims.</returns>
    /// <exception cref="Domain.Exceptions.UnauthorizedException">
    /// Thrown when the token is missing required claims, has a malformed user ID, or otherwise fails validation.
    /// </exception>
    public async Task<ValidatedToken> ValidateAccessTokenAsync(string token)
        => await ValidateTokenInternalAsync(token, _accessTokenSecret, "access");

    /// <summary>
    /// Validates a refresh token against the refresh token secret.
    /// </summary>
    /// <param name="token">The refresh token string to validate.</param>
    /// <returns>A <see cref="ValidatedToken"/> describing the token's claims.</returns>
    /// <exception cref="Domain.Exceptions.UnauthorizedException">
    /// Thrown when the token is missing required claims, has a malformed user ID, or otherwise fails validation.
    /// </exception>
    public async Task<ValidatedToken> ValidateRefreshTokenAsync(string token)
        => await ValidateTokenInternalAsync(token, _refreshTokenSecret, "refresh");

    /// <summary>
    /// Validates a confirmation token against the confirmation token secret.
    /// </summary>
    /// <param name="token">The confirmation token string to validate.</param>
    /// <returns>A <see cref="ValidatedToken"/> describing the token's claims.</returns>
    /// <exception cref="Domain.Exceptions.UnauthorizedException">
    /// Thrown when the token is missing required claims, has a malformed user ID, or otherwise fails validation.
    /// </exception>
    public async Task<ValidatedToken> ValidateConfirmationTokenAsync(string token)
        => await ValidateTokenInternalAsync(token, _confirmationTokenSecret, "confirmation");

    /// <summary>
    /// Performs the shared validation logic for access, refresh, and confirmation tokens:
    /// validates the JWT signature/expiration, then extracts and parses the user ID and username claims.
    /// </summary>
    /// <param name="token">The token string to validate.</param>
    /// <param name="secret">The secret key to validate the token's signature against.</param>
    /// <param name="tokenType">A human-readable label (e.g. "access", "refresh", "confirmation") used in error messages.</param>
    /// <returns>A <see cref="ValidatedToken"/> describing the token's claims.</returns>
    /// <exception cref="Domain.Exceptions.UnauthorizedException">
    /// Thrown when required claims are missing, the user ID claim is not a valid <see cref="Guid"/>,
    /// or the underlying token validation fails for any other reason (e.g. expired or invalid signature).
    /// </exception>
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

    /// <summary>
    /// Validates the given refresh token, looks up the associated user, and issues a fresh
    /// access/refresh token pair.
    /// </summary>
    /// <param name="refreshTokenString">The refresh token string to validate and exchange.</param>
    /// <returns>A <see cref="RefreshTokenResult"/> containing the user and newly issued tokens.</returns>
    /// <exception cref="Domain.Exceptions.UnauthorizedException">
    /// Thrown when the refresh token is invalid, or when the user account it refers to no longer exists.
    /// </exception>
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
