using System.Security.Claims;

namespace Infrastructure.Jwt;

public interface ITokenInfrastructure
{
    string GenerateJwt(
        Guid userId,
        string username,
        DateTime expiry,
        string secret
    );

    Task<ClaimsPrincipal> ValidateJwtAsync(string token, string secret);
}