using Domain.Entities;

namespace Service.Auth;

public record LoginServiceReturn(
    UserAccount UserAccount,
    string RefreshToken,
    string AccessToken
);
public interface ILoginService
{
    Task<LoginServiceReturn> LoginAsync(string username, string password);
}
