using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Domain.Exceptions;
using Features.Auth.Identity;
using Infrastructure.Jwt;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;

namespace Features.Auth.Services;

/// <summary>
///     Default implementation of <see cref="ITokenService" /> that generates and validates JWTs
///     for access, refresh, and confirmation flows using secrets read from configuration.
/// </summary>
public class TokenService : ITokenService
{
    private readonly string _accessTokenSecret;
    private readonly string _confirmationTokenSecret;
    private readonly string _refreshTokenSecret;
    private readonly ITokenInfrastructure _tokenInfrastructure;
    private readonly UserManager<ApplicationUser> _userManager;

    /// <exception cref="InvalidOperationException">
    ///     Thrown when any of the <c>ACCESS_TOKEN_SECRET</c>, <c>REFRESH_TOKEN_SECRET</c>, or
    ///     <c>CONFIRMATION_TOKEN_SECRET</c> configuration values are not set.
    /// </exception>
    public TokenService(
        ITokenInfrastructure tokenInfrastructure,
        UserManager<ApplicationUser> userManager,
        IConfiguration configuration
    )
    {
        _tokenInfrastructure = tokenInfrastructure;
        _userManager = userManager;

        _accessTokenSecret =
            configuration["ACCESS_TOKEN_SECRET"]
            ?? throw new InvalidOperationException(
                "ACCESS_TOKEN_SECRET environment variable is not set"
            );

        _refreshTokenSecret =
            configuration["REFRESH_TOKEN_SECRET"]
            ?? throw new InvalidOperationException(
                "REFRESH_TOKEN_SECRET environment variable is not set"
            );

        _confirmationTokenSecret =
            configuration["CONFIRMATION_TOKEN_SECRET"]
            ?? throw new InvalidOperationException(
                "CONFIRMATION_TOKEN_SECRET environment variable is not set"
            );
    }

    /// <inheritdoc />
    public string GenerateAccessToken(Guid userId, string username)
    {
        DateTime expiresAt = DateTime.UtcNow.AddHours(TokenServiceExpirationHours.AccessTokenHours);
        return _tokenInfrastructure.GenerateJwt(userId, username, expiresAt, _accessTokenSecret);
    }

    /// <inheritdoc />
    public string GenerateRefreshToken(Guid userId, string username)
    {
        DateTime expiresAt = DateTime.UtcNow.AddHours(
            TokenServiceExpirationHours.RefreshTokenHours
        );
        return _tokenInfrastructure.GenerateJwt(userId, username, expiresAt, _refreshTokenSecret);
    }

    /// <inheritdoc />
    public string GenerateConfirmationToken(Guid userId, string username)
    {
        DateTime expiresAt = DateTime.UtcNow.AddHours(
            TokenServiceExpirationHours.ConfirmationTokenHours
        );
        return _tokenInfrastructure.GenerateJwt(
            userId,
            username,
            expiresAt,
            _confirmationTokenSecret
        );
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
        ApplicationUser? user = await _userManager.FindByIdAsync(validated.UserId.ToString());
        if (user == null)
            throw new UnauthorizedException("User account not found");

        string newAccess = GenerateAccessToken(user.Id, user.UserName);
        string newRefresh = GenerateRefreshToken(user.Id, user.UserName);

        return new RefreshTokenResult(user.Id, user.UserName, newRefresh, newAccess);
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
