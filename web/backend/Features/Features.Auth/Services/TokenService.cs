using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Domain.Entities;
using Domain.Exceptions;
using Features.Auth.Repository;
using Infrastructure.Jwt;

namespace Features.Auth.Services;

/// <summary>
///     Default implementation of <see cref="ITokenService" /> that generates and validates JWTs
///     for access, refresh, and confirmation flows using secrets read from environment variables.
/// </summary>
public class TokenService : ITokenService
{
    private readonly string _accessTokenSecret;
    private readonly IAuthRepository _authRepository;
    private readonly string _confirmationTokenSecret;
    private readonly string _refreshTokenSecret;
    private readonly ITokenInfrastructure _tokenInfrastructure;

    /// <summary>Initializes a new instance of the <see cref="TokenService" /> class.</summary>
    /// <exception cref="InvalidOperationException">
    ///     Thrown when any of the <c>ACCESS_TOKEN_SECRET</c>, <c>REFRESH_TOKEN_SECRET</c>, or
    ///     <c>CONFIRMATION_TOKEN_SECRET</c> environment variables are not set.
    /// </exception>
    public TokenService(ITokenInfrastructure tokenInfrastructure, IAuthRepository authRepository)
    {
        _tokenInfrastructure = tokenInfrastructure;
        _authRepository = authRepository;

        _accessTokenSecret =
            Environment.GetEnvironmentVariable("ACCESS_TOKEN_SECRET")
            ?? throw new InvalidOperationException(
                "ACCESS_TOKEN_SECRET environment variable is not set"
            );

        _refreshTokenSecret =
            Environment.GetEnvironmentVariable("REFRESH_TOKEN_SECRET")
            ?? throw new InvalidOperationException(
                "REFRESH_TOKEN_SECRET environment variable is not set"
            );

        _confirmationTokenSecret =
            Environment.GetEnvironmentVariable("CONFIRMATION_TOKEN_SECRET")
            ?? throw new InvalidOperationException(
                "CONFIRMATION_TOKEN_SECRET environment variable is not set"
            );
    }

    /// <inheritdoc />
    public string GenerateAccessToken(UserAccount user)
    {
        DateTime expiresAt = DateTime.UtcNow.AddHours(TokenServiceExpirationHours.AccessTokenHours);
        return _tokenInfrastructure.GenerateJwt(
            user.UserAccountId,
            user.Username,
            expiresAt,
            _accessTokenSecret
        );
    }

    /// <inheritdoc />
    public string GenerateRefreshToken(UserAccount user)
    {
        DateTime expiresAt = DateTime.UtcNow.AddHours(
            TokenServiceExpirationHours.RefreshTokenHours
        );
        return _tokenInfrastructure.GenerateJwt(
            user.UserAccountId,
            user.Username,
            expiresAt,
            _refreshTokenSecret
        );
    }

    /// <inheritdoc />
    public string GenerateConfirmationToken(UserAccount user)
    {
        DateTime expiresAt = DateTime.UtcNow.AddHours(
            TokenServiceExpirationHours.ConfirmationTokenHours
        );
        return _tokenInfrastructure.GenerateJwt(
            user.UserAccountId,
            user.Username,
            expiresAt,
            _confirmationTokenSecret
        );
    }

    /// <inheritdoc />
    public async Task<ValidatedToken> ValidateAccessTokenAsync(string token)
    {
        return await ValidateTokenInternalAsync(token, _accessTokenSecret, "access");
    }

    /// <inheritdoc />
    public async Task<ValidatedToken> ValidateRefreshTokenAsync(string token)
    {
        return await ValidateTokenInternalAsync(token, _refreshTokenSecret, "refresh");
    }

    /// <inheritdoc />
    public async Task<ValidatedToken> ValidateConfirmationTokenAsync(string token)
    {
        return await ValidateTokenInternalAsync(token, _confirmationTokenSecret, "confirmation");
    }

    /// <inheritdoc />
    public async Task<RefreshTokenResult> RefreshTokenAsync(string refreshTokenString)
    {
        ValidatedToken validated = await ValidateRefreshTokenAsync(refreshTokenString);
        UserAccount? user = await _authRepository.GetUserByIdAsync(validated.UserId);
        if (user == null)
            throw new UnauthorizedException("User account not found");

        string newAccess = GenerateAccessToken(user);
        string newRefresh = GenerateRefreshToken(user);

        return new RefreshTokenResult(user, newRefresh, newAccess);
    }

    /// <summary>
    ///     Performs the shared validation logic for access, refresh, and confirmation tokens:
    ///     validates the JWT signature/expiration, then extracts and parses the user ID and username claims.
    /// </summary>
    /// <param name="tokenType">A human-readable label (e.g. "access", "refresh", "confirmation") used in error messages.</param>
    /// <exception cref="Domain.Exceptions.UnauthorizedException">
    ///     Thrown when required claims are missing, the user ID claim is not a valid <see cref="Guid" />,
    ///     or the underlying token validation fails for any other reason (e.g. expired or invalid signature).
    /// </exception>
    private async Task<ValidatedToken> ValidateTokenInternalAsync(
        string token,
        string secret,
        string tokenType
    )
    {
        try
        {
            ClaimsPrincipal principal = await _tokenInfrastructure.ValidateJwtAsync(token, secret);

            string? userIdClaim = principal.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
            string? usernameClaim = principal.FindFirst(JwtRegisteredClaimNames.UniqueName)?.Value;

            if (string.IsNullOrEmpty(userIdClaim) || string.IsNullOrEmpty(usernameClaim))
                throw new UnauthorizedException(
                    $"Invalid {tokenType} token: missing required claims"
                );

            if (!Guid.TryParse(userIdClaim, out Guid userId))
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
}
