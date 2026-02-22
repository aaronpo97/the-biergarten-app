using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using JwtRegisteredClaimNames = System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames;

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

        var key = Encoding.UTF8.GetBytes(
            secret ?? throw new InvalidOperationException("secret not set")
        );

        // Base claims (always present)
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.UniqueName, username),
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
}
