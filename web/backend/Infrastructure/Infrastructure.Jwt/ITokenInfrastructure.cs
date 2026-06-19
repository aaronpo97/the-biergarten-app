using System.Security.Claims;

namespace Infrastructure.Jwt;

/// <summary>
/// Service for generating and validating JSON Web Tokens (JWTs) used for authentication.
/// </summary>
public interface ITokenInfrastructure
{
    /// <summary>
    /// Generates a signed JWT for the given user.
    /// </summary>
    /// <param name="userId">The unique identifier of the user the token is issued for.</param>
    /// <param name="username">The username of the user, included as a claim.</param>
    /// <param name="expiry">The date and time at which the token expires.</param>
    /// <param name="secret">The symmetric secret used to sign the token.</param>
    /// <returns>The serialized, signed JWT string.</returns>
    string GenerateJwt(
        Guid userId,
        string username,
        DateTime expiry,
        string secret
    );

    /// <summary>
    /// Validates a JWT and returns the resulting claims principal.
    /// </summary>
    /// <param name="token">The JWT string to validate.</param>
    /// <param name="secret">The symmetric secret used to verify the token's signature.</param>
    /// <returns>A <see cref="ClaimsPrincipal"/> representing the validated token's claims.</returns>
    /// <exception cref="Domain.Exceptions.UnauthorizedException">Thrown when the token is invalid, expired, or fails validation.</exception>
    Task<ClaimsPrincipal> ValidateJwtAsync(string token, string secret);
}