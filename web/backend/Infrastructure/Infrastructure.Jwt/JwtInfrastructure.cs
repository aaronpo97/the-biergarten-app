using System.Security.Claims;
using System.Text;
using Domain.Exceptions;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using JwtRegisteredClaimNames = System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames;

namespace Infrastructure.Jwt;

/// <summary>
///     Generates and validates HMAC-SHA256 signed JWTs using <see cref="JsonWebTokenHandler" />.
/// </summary>
public class JwtInfrastructure : ITokenInfrastructure
{
    /// <summary>
    ///     Generates a signed JWT, signed using HMAC-SHA256 with the provided secret.
    /// </summary>
    /// <remarks>
    ///     Sets registered claims <c>sub</c> (userId), <c>unique_name</c> (username), <c>iat</c> (current UTC time),
    ///     <c>exp</c> (expiry), and <c>jti</c> (a newly generated GUID).
    /// </remarks>
    /// <param name="secret">The symmetric secret used to sign the token (encoded as UTF-8 bytes).</param>
    public string GenerateJwt(Guid userId, string username, DateTime expiry, string secret)
    {
        JsonWebTokenHandler handler = new();
        byte[] key = Encoding.UTF8.GetBytes(secret);
        List<Claim> claims = new()
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.UniqueName, username),
            new Claim(
                JwtRegisteredClaimNames.Iat,
                DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString()
            ),
            new Claim(
                JwtRegisteredClaimNames.Exp,
                new DateTimeOffset(expiry).ToUnixTimeSeconds().ToString()
            ),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        SecurityTokenDescriptor tokenDescriptor = new()
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiry,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256
            ),
        };

        return handler.CreateToken(tokenDescriptor);
    }

    /// <summary>
    ///     Validates a JWT's signature and lifetime (issuer and audience validation are disabled),
    ///     using the provided secret as the HMAC-SHA256 symmetric signing key.
    /// </summary>
    /// <param name="secret">The symmetric secret used to verify the token's signature (encoded as UTF-8 bytes).</param>
    /// <exception cref="UnauthorizedException">
    ///     Thrown when the token is invalid, has no claims identity, is expired, or otherwise fails validation.
    /// </exception>
    public async Task<ClaimsPrincipal> ValidateJwtAsync(string token, string secret)
    {
        JsonWebTokenHandler handler = new();
        byte[] keyBytes = Encoding.UTF8.GetBytes(secret);
        TokenValidationParameters parameters = new()
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
        };

        try
        {
            TokenValidationResult? result = await handler.ValidateTokenAsync(token, parameters);
            if (!result.IsValid || result.ClaimsIdentity == null)
                throw new UnauthorizedAccessException();

            return new ClaimsPrincipal(result.ClaimsIdentity);
        }
        catch (Exception)
        {
            throw new UnauthorizedException("Invalid token");
        }
    }
}
