using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using JwtRegisteredClaimNames = System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames;

namespace ServiceCore.Services;
public class JwtService(IConfiguration config) : IJwtService
{
    // private readonly string? _secret = config["Jwt:Secret"];
    private readonly string? _secret = "128490218jfklsdajfdsa90f8sd0fid0safasr31jl2k1j4AFSDR!@#$fdsafjdslajfl";
    public string GenerateJwt(Guid userId, string username, DateTime expiry)
    {
        var handler = new JsonWebTokenHandler();
        
        var key = Encoding.UTF8.GetBytes(_secret ?? throw new InvalidOperationException("secret not set"));

        // Base claims (always present)
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.UniqueName, username),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiry,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256)
        };

        return handler.CreateToken(tokenDescriptor);
    }
}