using Domain.Entities;

namespace Service.Auth;

public interface IRegisterService
{
    Task<UserAccount> RegisterAsync(UserAccount userAccount, string password);
}
