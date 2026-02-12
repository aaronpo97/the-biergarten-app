namespace Infrastructure.Jwt;

public interface IJwtService
{
    string GenerateJwt(Guid userId, string username, DateTime expiry);
}
