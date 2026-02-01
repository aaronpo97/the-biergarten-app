namespace ServiceCore.Services;

public interface IJwtService
{
    string GenerateJwt(Guid userId, string username, DateTime expiry);
}