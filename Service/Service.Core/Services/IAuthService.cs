using DataAccessLayer.Entities;

namespace BusinessLayer.Services
{
    public interface IAuthService
    {
        Task<UserAccount> RegisterAsync(UserAccount userAccount, string password);
        Task<bool> LoginAsync(string usernameOrEmail, string password);
        Task InvalidateAsync(Guid userAccountId);
    }
}
