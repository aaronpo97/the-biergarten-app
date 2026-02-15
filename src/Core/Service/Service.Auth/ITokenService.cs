using Domain.Entities;
using Infrastructure.Jwt;

namespace Service.Auth;

public interface ITokenService
{
    public string GenerateAccessToken(UserAccount user);
    public string GenerateRefreshToken(UserAccount user);
}

public class TokenService(ITokenInfrastructure tokenInfrastructure)
    : ITokenService
{
    public string GenerateAccessToken(UserAccount userAccount)
    {
        var jwtExpiresAt = DateTime.UtcNow.AddHours(1);
        return tokenInfrastructure.GenerateJwt(
            userAccount.UserAccountId,
            userAccount.Username,
            jwtExpiresAt
        );
    }

    public string GenerateRefreshToken(UserAccount userAccount)
    {
        var jwtExpiresAt = DateTime.UtcNow.AddDays(21);
        return tokenInfrastructure.GenerateJwt(
            userAccount.UserAccountId,
            userAccount.Username,
            jwtExpiresAt
        );
    }
}
