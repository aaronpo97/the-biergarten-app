using DataAccessLayer.Entities;

namespace ServiceCore.Services
{
    public interface IAuthService
    {
        Task<UserAccount> RegisterAsync(UserAccount userAccount, string password);
        Task<UserAccount?> LoginAsync(string username, string password);
    }
}