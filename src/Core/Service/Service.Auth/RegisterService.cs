using Domain.Entities;
using Domain.Exceptions;
using Infrastructure.Email;
using Infrastructure.Email.Templates.Rendering;
using Infrastructure.PasswordHashing;
using Infrastructure.Repository.Auth;
using Microsoft.Extensions.Logging;
using Service.Emails;

namespace Service.Auth;

public class RegisterService(
    IAuthRepository authRepo,
    IPasswordInfrastructure passwordInfrastructure,
    ITokenService tokenService,
    IEmailService emailService
) : IRegisterService
{
    private async Task ValidateUserDoesNotExist(UserAccount userAccount)
    {
        // Check if user already exists
        var existingUsername = await authRepo.GetUserByUsernameAsync(
            userAccount.Username
        );
        var existingEmail = await authRepo.GetUserByEmailAsync(
            userAccount.Email
        );

        if (existingUsername != null || existingEmail != null)
        {
            throw new ConflictException("Username or email already exists");
        }
    }

    public async Task<RegisterServiceReturn> RegisterAsync(
        UserAccount userAccount,
        string password
    )
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
            hashed
        );

        var accessToken = tokenService.GenerateAccessToken(createdUser);
        var refreshToken = tokenService.GenerateRefreshToken(createdUser);

        if (string.IsNullOrEmpty(accessToken) || string.IsNullOrEmpty(refreshToken))
        {
            return new RegisterServiceReturn(createdUser);
        }


        bool emailSent = false;
        try
        {
            // send confirmation email
            await emailService.SendRegistrationEmailAsync(
                createdUser,
                "some-confirmation-token"
            );

            emailSent = true;
        }
        catch
        {
            // ignored
        }


        return new RegisterServiceReturn(createdUser, accessToken, refreshToken, emailSent);
    }
}