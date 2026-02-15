using Domain.Entities;
using Domain.Exceptions;
using Infrastructure.Email;
using Infrastructure.Email.Templates.Rendering;
using Infrastructure.PasswordHashing;
using Infrastructure.Repository.Auth;

namespace Service.Auth;

public class RegisterService(
    IAuthRepository authRepo,
    IPasswordInfrastructure passwordInfrastructure
) : IRegisterService
{
    private async Task ValidateUserDoesNotExist(UserAccount userAccount)
    {
        // Check if user already exists
        var existingUsername = await authRepo.GetUserByUsernameAsync(userAccount.Username);
        var existingEmail = await authRepo.GetUserByEmailAsync(userAccount.Email);

        if (existingUsername != null || existingEmail != null)
        {
            throw new ConflictException("Username or email already exists");
        }
    }

    public async Task<UserAccount> RegisterAsync(UserAccount userAccount, string password)
    {
        await ValidateUserDoesNotExist(userAccount);
        // password hashing
        var hashed = passwordInfrastructure.Hash(password);

        // Register user with hashed password and get the created user with generated ID
        var createdUser = await authRepo.RegisterUserAsync(
            userAccount.Username,
            userAccount.FirstName,
            userAccount.LastName,
            userAccount.Email,
            userAccount.DateOfBirth,
            hashed);

        return createdUser;
    }
}
