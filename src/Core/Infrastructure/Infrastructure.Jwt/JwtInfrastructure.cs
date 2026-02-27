using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using JwtRegisteredClaimNames = System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames;
using Domain.Exceptions;

namespace Infrastructure.Jwt;

public class JwtInfrastructure : ITokenInfrastructure
{
    public string GenerateJwt(
        Guid userId,
        string username,
        DateTime expiry,
        string secret
    )
    {
        var handler = new JsonWebTokenHandler();
        var key = Encoding.UTF8.GetBytes(secret);
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.UniqueName, username),
            new(
                JwtRegisteredClaimNames.Iat,
                DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString()
            ),
            new(
                JwtRegisteredClaimNames.Exp,
                new DateTimeOffset(expiry).ToUnixTimeSeconds().ToString()
            ),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        };

        var tokenDescriptor = new SecurityTokenDescriptor
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


    public async Task<ClaimsPrincipal> ValidateJwtAsync(
        string token,
        string secret
    )
    {
        var handler = new JsonWebTokenHandler();
        var keyBytes = Encoding.UTF8.GetBytes(
            secret
        );
        var parameters = new TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes),
        };

        try
        {
            var result = await handler.ValidateTokenAsync(token, parameters);
            if (!result.IsValid || result.ClaimsIdentity == null)
                throw new UnauthorizedAccessException();
            
            return new ClaimsPrincipal(result.ClaimsIdentity);
        }
        catch (Exception e)
        {
            throw new UnauthorizedException("Invalid token");
        }
    }
}