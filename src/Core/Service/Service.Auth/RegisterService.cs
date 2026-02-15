using Domain.Entities;
using Domain.Exceptions;
using Infrastructure.Email;
using Infrastructure.Email.Templates.Rendering;
using Infrastructure.PasswordHashing;
using Infrastructure.Repository.Auth;

namespace Service.Auth;

public class RegisterService(
    IAuthRepository authRepo,
    IPasswordInfrastructure passwordInfrastructure,
    IEmailProvider emailProvider,
    IEmailTemplateProvider emailTemplateProvider
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

        // Register user with hashed password and get the created user with generated ID
        var createdUser = await authRepo.RegisterUserAsync(
            userAccount.Username,
            userAccount.FirstName,
            userAccount.LastName,
            userAccount.Email,
            userAccount.DateOfBirth,
            hashed);


        // Generate confirmation link (TODO: implement proper token-based confirmation)
        var confirmationLink = $"https://thebiergarten.app/confirm?email={Uri.EscapeDataString(createdUser.Email)}";

        // Render email template
        var emailHtml = await emailTemplateProvider.RenderUserRegisteredEmailAsync(
            createdUser.FirstName,
            confirmationLink
        );

        // Send welcome email with rendered template
        await emailProvider.SendAsync(
            createdUser.Email,
            "Welcome to The Biergarten App!",
            emailHtml,
            isHtml: true
        );

        return createdUser;
    }
}
