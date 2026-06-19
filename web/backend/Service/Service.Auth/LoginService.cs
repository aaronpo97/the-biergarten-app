using Domain.Entities;
using Domain.Exceptions;
using Infrastructure.PasswordHashing;
using Infrastructure.Repository.Auth;

namespace Service.Auth;


/// <summary>
/// Handles authenticating users by verifying their credentials and issuing access/refresh tokens.
/// </summary>
/// <param name="authRepo">Repository used to look up user accounts and their active credentials.</param>
/// <param name="passwordInfrastructure">Infrastructure component used to verify a plain-text password against a stored hash.</param>
/// <param name="tokenService">Service used to generate access and refresh tokens for an authenticated user.</param>
public class LoginService(
    IAuthRepository authRepo,
    IPasswordInfrastructure passwordInfrastructure,
    ITokenService tokenService
) : ILoginService
{
    /// <summary>
    /// Authenticates a user by username and password, issuing a new access and refresh token on success.
    /// </summary>
    /// <param name="username">The username of the account to authenticate.</param>
    /// <param name="password">The plain-text password to verify against the stored credential.</param>
    /// <returns>A <see cref="LoginServiceReturn"/> containing the authenticated user and issued tokens.</returns>
    /// <exception cref="Domain.Exceptions.UnauthorizedException">
    /// Thrown when the username does not match any account, the account has no active credential,
    /// or the supplied password does not match the stored hash.
    /// </exception>
    public async Task<LoginServiceReturn> LoginAsync(
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

        return new LoginServiceReturn(user, refreshToken, accessToken);
    }
}
