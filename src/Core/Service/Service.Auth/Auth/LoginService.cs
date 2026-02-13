using System.Threading.Tasks;
using Domain.Entities;
using Infrastructure.PasswordHashing;
using Infrastructure.Repository.Auth;

namespace Service.Auth.Auth;

public class LoginService(
    IAuthRepository authRepo,
    IPasswordInfrastructure passwordInfrastructure
) : ILoginService
{

    public async Task<UserAccount?> LoginAsync(string username, string password)
    {
        // Attempt lookup by username
        var user = await authRepo.GetUserByUsernameAsync(username);

        // the user was not found
        if (user is null) return null;

        // @todo handle expired passwords
        var activeCred = await authRepo.GetActiveCredentialByUserAccountIdAsync(user.UserAccountId);

        if (activeCred is null) return null;
        return !passwordInfrastructure.Verify(password, activeCred.Hash) ? null : user;
    }
}
