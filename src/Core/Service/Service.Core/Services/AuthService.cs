using DataAccessLayer.Entities;
using DataAccessLayer.Repositories.UserAccount;
using DataAccessLayer.Repositories.UserCredential;

namespace BusinessLayer.Services
{
    public class AuthService(IUserAccountRepository userRepo, IUserCredentialRepository credRepo) : IAuthService
    {
        public async Task<UserAccount> RegisterAsync(UserAccount userAccount, string password)
        {
            if (userAccount.UserAccountId == Guid.Empty)
            {
                userAccount.UserAccountId = Guid.NewGuid();
            }

            await userRepo.AddAsync(userAccount);

            var credential = new UserCredential
            {
                UserAccountId = userAccount.UserAccountId,
                Hash = PasswordHasher.Hash(password)
            };

            await credRepo.RotateCredentialAsync(userAccount.UserAccountId, credential);

            return userAccount;
        }

        public async Task<bool> LoginAsync(string usernameOrEmail, string password)
        {
            // Attempt lookup by username, then email
            var user = await userRepo.GetByUsernameAsync(usernameOrEmail) 
                       ?? await userRepo.GetByEmailAsync(usernameOrEmail);

            if (user is null) return false;

            var activeCred = await credRepo.GetActiveCredentialByUserAccountIdAsync(user.UserAccountId);
            if (activeCred is null) return false;

            return PasswordHasher.Verify(password, activeCred.Hash);
        }

        public async Task InvalidateAsync(Guid userAccountId)
        {
            await credRepo.InvalidateCredentialsByUserAccountIdAsync(userAccountId);
        }
    }
}
