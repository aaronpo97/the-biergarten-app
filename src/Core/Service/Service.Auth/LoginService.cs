using Domain.Entities;
using Domain.Exceptions;
using Infrastructure.PasswordHashing;
using Infrastructure.Repository.Auth;

namespace Service.Auth;

public class LoginService(
    IAuthRepository authRepo,
    IPasswordInfrastructure passwordInfrastructure
) : ILoginService
{

    public async Task<UserAccount> LoginAsync(string username, string password)
    {
        // Attempt lookup by username
        var user = await authRepo.GetUserByUsernameAsync(username);

        // the user was not found
        if (user is null)
            throw new UnauthorizedException("Invalid username or password.");

        // @todo handle expired passwords
        var activeCred = await authRepo.GetActiveCredentialByUserAccountIdAsync(user.UserAccountId);

        if (activeCred is null)
            throw new UnauthorizedException("Invalid username or password.");

        if (!passwordInfrastructure.Verify(password, activeCred.Hash))
            throw new UnauthorizedException("Invalid username or password.");

        return user;
    }
}
