namespace Infrastructure.Jwt;

public interface ITokenInfrastructure
{
    string GenerateJwt(Guid userId, string username, DateTime expiry);
}
