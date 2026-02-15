using Domain.Entities;
using Domain.Exceptions;
using Infrastructure.PasswordHashing;
using Infrastructure.Repository.Auth;

namespace Service.Auth;

public class LoginService(
    IAuthRepository authRepo,
    IPasswordInfrastructure passwordInfrastructure,
    ITokenService tokenService
) : ILoginService
{
    public async Task<AuthServiceReturn> LoginAsync(
        string username,
        string password
    )
    {
        // Attempt lookup by username
        // the user was not found
        var user =
            await authRepo.GetUserByUsernameAsync(username)
            ?? throw new UnauthorizedException("Invalid username or password.");

        // @todo handle expired passwords
        var activeCred =
            await authRepo.GetActiveCredentialByUserAccountIdAsync(
                user.UserAccountId
            )
            ?? throw new UnauthorizedException("Invalid username or password.");

        if (!passwordInfrastructure.Verify(password, activeCred.Hash))
            throw new UnauthorizedException("Invalid username or password.");

        string accessToken = tokenService.GenerateAccessToken(user);
        string refreshToken = tokenService.GenerateRefreshToken(user);

        return new AuthServiceReturn(user, refreshToken, accessToken);
    }
}
