using System.Threading.Tasks;
using Domain.Entities;
using Domain.Exceptions;
using Infrastructure.Email;
using Infrastructure.PasswordHashing;
using Infrastructure.Repository.Auth;

namespace Service.Auth.Auth;

public class RegisterService(
    IAuthRepository authRepo,
    IPasswordInfrastructure passwordInfrastructure,
    IEmailService emailService
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
        await authRepo.RegisterUserAsync(
            userAccount.Username,
            userAccount.FirstName,
            userAccount.LastName,
            userAccount.Email,
            userAccount.DateOfBirth,
            hashed);

        // Send welcome email
        await emailService.SendAsync(
            userAccount.Email,
            "Welcome to The Biergarten App!",
            $"Hi {userAccount.FirstName},\n\nThank you for registering with The Biergarten App! We're excited to have you on board.\n\nBest regards,\nThe Biergarten Team"
        );
        
        return userAccount;
    }
}