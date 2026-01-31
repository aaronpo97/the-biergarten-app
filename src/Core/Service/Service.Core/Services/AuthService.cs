using DataAccessLayer.Entities;
using DataAccessLayer.Repositories.UserAccount;

namespace ServiceCore.Services
{
    public class AuthService(IUserAccountRepository userRepo, IUserCredentialRepository credRepo) : IAuthService
    {
        public async Task<UserAccount> RegisterAsync(UserAccount userAccount, string password)
        {
            throw  new NotImplementedException();
        }

        public async Task<UserAccount?> LoginAsync(string usernameOrEmail, string password)
        {
            // Attempt lookup by username, then email
            var user = await userRepo.GetByUsernameAsync(usernameOrEmail)
                       ?? await userRepo.GetByEmailAsync(usernameOrEmail);
            // the user was not found
            if (user is null)
            {
                return null;
            }
            
            // they don't have an active credential
            // @todo handle expired passwords
            var activeCred = await credRepo.GetActiveCredentialByUserAccountIdAsync(user.UserAccountId);
            if (activeCred is null)
            {
                return null;
            }

            if (!PasswordHasher.Verify(password, activeCred.Hash))
            {
                return null;
            }

            return user;
        }

        public async Task InvalidateAsync(Guid userAccountId)
        {
            await credRepo.InvalidateCredentialsByUserAccountIdAsync(userAccountId);
        }
    }
}
