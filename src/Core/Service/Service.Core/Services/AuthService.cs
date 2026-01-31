using DataAccessLayer.Entities;
using DataAccessLayer.Repositories.UserAccount;

namespace ServiceCore.Services
{
    public class AuthService(IUserAccountRepository userRepo, IUserCredentialRepository credRepo) : IAuthService
    {
        public async Task<UserAccount> RegisterAsync(UserAccount userAccount, string password)
        {
            throw new NotImplementedException();
        }

        public async Task<UserAccount?> LoginAsync(string username, string password)
        {
            // Attempt lookup by username
            var user = await userRepo.GetByUsernameAsync(username);
        
            // the user was not found
            if (user is null) return null;

            // @todo handle expired passwords
            var activeCred = await credRepo.GetActiveCredentialByUserAccountIdAsync(user.UserAccountId);
            
            if (activeCred is null) return null;    
            if (!PasswordHasher.Verify(password, activeCred.Hash)) return null;
            
            return user;
        }

        public async Task InvalidateAsync(Guid userAccountId)
        {
            await credRepo.InvalidateCredentialsByUserAccountIdAsync(userAccountId);
        }
    }
}
