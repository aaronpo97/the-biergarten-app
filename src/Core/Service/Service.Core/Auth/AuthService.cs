using Domain.Core.Entities;
using Repository.Core.Repositories.Auth;
using Service.Core.Password;

namespace Service.Core.Auth;

public class AuthService(
    IAuthRepository authRepo,
    IPasswordService passwordService
) : IAuthService
{
    public async Task<UserAccount> RegisterAsync(UserAccount userAccount, string password)
    {
        // Check if user already exists
        var user = await authRepo.GetUserByUsernameAsync(userAccount.Username);
        if (user is not null)
        {
            return null!;
        }

        // password hashing
        var hashed = passwordService.Hash(password);

        // Register user with hashed password
        return await authRepo.RegisterUserAsync(
            userAccount.Username,
            userAccount.FirstName,
            userAccount.LastName,
            userAccount.Email,
            userAccount.DateOfBirth,
            hashed);
    }

    public async Task<UserAccount?> LoginAsync(string username, string password)
    {
        // Attempt lookup by username
        var user = await authRepo.GetUserByUsernameAsync(username);

        // the user was not found
        if (user is null) return null;

        // @todo handle expired passwords
        var activeCred = await authRepo.GetActiveCredentialByUserAccountIdAsync(user.UserAccountId);

        if (activeCred is null) return null;
        return !passwordService.Verify(password, activeCred.Hash) ? null : user;
    }
}
