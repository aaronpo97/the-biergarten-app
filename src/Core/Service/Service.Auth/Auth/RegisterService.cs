using System.Threading.Tasks;
using Domain.Entities;
using Domain.Exceptions;
using Infrastructure.PasswordHashing;
using Infrastructure.Repository.Auth;

namespace Service.Auth.Auth;

public class RegisterService(
    IAuthRepository authRepo,
    IPasswordInfrastructure passwordInfrastructure
) : IRegisterService
{
    public async Task<UserAccount> RegisterAsync(UserAccount userAccount, string password)
    {
        // Check if user already exists
        var existingUsername = await authRepo.GetUserByUsernameAsync(userAccount.Username);
        var existingEmail = await authRepo.GetUserByEmailAsync(userAccount.Email);

        if (existingUsername != null || existingEmail != null)
        {
            throw new ConflictException("Username or email already exists");
        }



        // password hashing
        var hashed = passwordInfrastructure.Hash(password);

        // Register user with hashed password
        return await authRepo.RegisterUserAsync(
            userAccount.Username,
            userAccount.FirstName,
            userAccount.LastName,
            userAccount.Email,
            userAccount.DateOfBirth,
            hashed);
    }


}
