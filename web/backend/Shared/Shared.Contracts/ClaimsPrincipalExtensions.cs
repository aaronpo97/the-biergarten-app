using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Domain.Exceptions;

namespace Shared.Contracts;

/// <summary>Extension methods for reading well-known claims off an authenticated <see cref="ClaimsPrincipal" />.</summary>
public static class ClaimsPrincipalExtensions
{
    /// <summary>
    ///     Extracts the authenticated caller's user ID from the validated access token's <c>sub</c> claim.
    /// </summary>
    /// <exception cref="UnauthorizedException">Thrown when the claim is missing or malformed.</exception>
    public static Guid GetAuthenticatedUserId(this ClaimsPrincipal user)
    {
        string? userIdClaim = user.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        if (!Guid.TryParse(userIdClaim, out Guid userId))
            throw new UnauthorizedException("Access token is missing a valid user ID claim");
        return userId;
    }
}
