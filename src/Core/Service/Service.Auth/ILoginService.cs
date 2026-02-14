using Domain.Entities;

namespace Service.Auth;

public interface ILoginService
{
    Task<UserAccount> LoginAsync(string username, string password);
}
