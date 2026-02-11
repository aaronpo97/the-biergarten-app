using Domain.Core.Entities;

namespace Service.Core.Auth;

public interface IAuthService
{
    Task<UserAccount> RegisterAsync(UserAccount userAccount, string password);
    Task<UserAccount?> LoginAsync(string username, string password);
}
