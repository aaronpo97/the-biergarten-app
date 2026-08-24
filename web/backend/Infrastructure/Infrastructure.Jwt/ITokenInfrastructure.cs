using System.Security.Claims;

namespace Infrastructure.Jwt;

/// <summary>
///     Service for generating and validating JSON Web Tokens (JWTs) used for authentication.
/// </summary>
public interface ITokenInfrastructure
{
    /// <summary>
    ///     Generates a signed JWT for the given user.
    /// </summary>
    string GenerateJwt(Guid userId, string username, DateTime expiry, string secret);

    /// <exception cref="Domain.Exceptions.UnauthorizedException">Thrown when the token is invalid, expired, or fails validation.</exception>
    Task<ClaimsPrincipal> ValidateJwtAsync(string token, string secret);
}
