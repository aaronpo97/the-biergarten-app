using Domain.Entities;

namespace Service.Auth;

public record AuthServiceReturn(
    UserAccount UserAccount,
    string RefreshToken,
    string AccessToken
);

public interface IRegisterService
{
    Task<AuthServiceReturn> RegisterAsync(
        UserAccount userAccount,
        string password
    );
}
