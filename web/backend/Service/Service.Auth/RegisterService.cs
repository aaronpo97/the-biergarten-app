using Domain.Entities;
using Domain.Exceptions;
using Infrastructure.Email;
using Infrastructure.Email.Templates.Rendering;
using Infrastructure.PasswordHashing;
using Infrastructure.Repository.Auth;
using Microsoft.Extensions.Logging;
using Service.Emails;

namespace Service.Auth;

/// <summary>
/// Handles registration of new user accounts, including uniqueness validation, password hashing,
/// token issuance, and sending the registration confirmation email.
/// </summary>
/// <param name="authRepo">Repository used to check for existing users and persist the new account.</param>
/// <param name="passwordInfrastructure">Infrastructure component used to hash the user's plain-text password.</param>
/// <param name="tokenService">Service used to generate access, refresh, and confirmation tokens.</param>
/// <param name="emailService">Service used to send the registration confirmation email.</param>
public class RegisterService(
    IAuthRepository authRepo,
    IPasswordInfrastructure passwordInfrastructure,
    ITokenService tokenService,
    IEmailService emailService
) : IRegisterService
{
    /// <summary>
    /// Verifies that no existing user account has the same username or email as the given account.
    /// </summary>
    /// <param name="userAccount">The candidate user account whose username and email should be checked for uniqueness.</param>
    /// <exception cref="Domain.Exceptions.ConflictException">
    /// Thrown when an existing account already has the same username or email address.
    /// </exception>
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

    /// <summary>
    /// Registers a new user account: validates uniqueness, hashes the password, persists the account,
    /// issues access/refresh/confirmation tokens, and attempts to send the registration confirmation email.
    /// </summary>
    /// <param name="userAccount">The user account details to register.</param>
    /// <param name="password">The plain-text password to hash and store for the new account.</param>
    /// <returns>
    /// A <see cref="RegisterServiceReturn"/> describing the outcome. If token generation fails, the
    /// returned value has <see cref="RegisterServiceReturn.IsAuthenticated"/> set to <c>false</c> and no tokens.
    /// Otherwise tokens are populated and <see cref="RegisterServiceReturn.EmailSent"/> reflects whether the
    /// confirmation email was sent successfully (failures to send the email are swallowed and do not fail registration).
    /// </returns>
    /// <exception cref="Domain.Exceptions.ConflictException">
    /// Thrown when an existing account already has the same username or email address.
    /// </exception>
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
        var confirmationToken = tokenService.GenerateConfirmationToken(createdUser);

        if (
            string.IsNullOrEmpty(accessToken)
            || string.IsNullOrEmpty(refreshToken)
        )
        {
            return new RegisterServiceReturn(createdUser);
        }

        bool emailSent = false;
        try
        {
            // send confirmation email
            await emailService.SendRegistrationEmailAsync(
                createdUser, confirmationToken
            );

            emailSent = true;
        }
        catch (Exception ex)
        {
            await Console.Error.WriteLineAsync(ex.Message);
            Console.WriteLine("Could not send email.");
            // ignored
        }

        return new RegisterServiceReturn(
            createdUser,
            accessToken,
            refreshToken,
            emailSent
        );
    }
}