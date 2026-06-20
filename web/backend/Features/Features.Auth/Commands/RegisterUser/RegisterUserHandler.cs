using Domain.Entities;
using Domain.Exceptions;
using Features.Auth.Dtos;
using Features.Auth.Repository;
using Features.Auth.Services;
using Infrastructure.PasswordHashing;
using MediatR;
using Shared.Application.Emails;

namespace Features.Auth.Commands.RegisterUser;

/// <summary>
///     Handles <see cref="RegisterUserCommand" />: validates uniqueness, hashes the password, persists the
///     account, issues access/refresh/confirmation tokens, and attempts to send the registration
///     confirmation email via Features.Emails.
/// </summary>
/// <param name="authRepo">Repository used to check for existing users and persist the new account.</param>
/// <param name="passwordInfrastructure">Infrastructure component used to hash the user's plain-text password.</param>
/// <param name="tokenService">Service used to generate access, refresh, and confirmation tokens.</param>
/// <param name="mediator">Used to send the cross-slice command that triggers the confirmation email.</param>
public class RegisterUserHandler(
    IAuthRepository authRepo,
    IPasswordInfrastructure passwordInfrastructure,
    ITokenService tokenService,
    IMediator mediator
) : IRequestHandler<RegisterUserCommand, RegistrationPayload>
{
    /// <exception cref="ConflictException">
    ///     Thrown when an existing account already has the same username or email address.
    /// </exception>
    public async Task<RegistrationPayload> Handle(RegisterUserCommand request, CancellationToken cancellationToken)
    {
        await ValidateUserDoesNotExist(request.Username, request.Email);

        string hashed = passwordInfrastructure.Hash(request.Password);

        UserAccount createdUser = await authRepo.RegisterUserAsync(
            request.Username,
            request.FirstName,
            request.LastName,
            request.Email,
            request.DateOfBirth,
            hashed
        );

        string accessToken = tokenService.GenerateAccessToken(createdUser);
        string refreshToken = tokenService.GenerateRefreshToken(createdUser);
        string confirmationToken = tokenService.GenerateConfirmationToken(createdUser);

        if (string.IsNullOrEmpty(accessToken) || string.IsNullOrEmpty(refreshToken))
            return new RegistrationPayload(createdUser.UserAccountId, createdUser.Username, string.Empty, string.Empty,
                false);

        bool emailSent = false;
        try
        {
            await mediator.Send(
                new SendRegistrationEmailCommand(createdUser.FirstName, createdUser.Email, confirmationToken),
                cancellationToken
            );
            emailSent = true;
        }
        catch (Exception ex)
        {
            await Console.Error.WriteLineAsync(ex.Message);
            Console.WriteLine("Could not send email.");
            // ignored
        }

        return new RegistrationPayload(createdUser.UserAccountId, createdUser.Username, refreshToken, accessToken,
            emailSent);
    }

    /// <exception cref="ConflictException">
    ///     Thrown when an existing account already has the same username or email address.
    /// </exception>
    private async Task ValidateUserDoesNotExist(string username, string email)
    {
        UserAccount? existingUsername = await authRepo.GetUserByUsernameAsync(username);
        UserAccount? existingEmail = await authRepo.GetUserByEmailAsync(email);

        if (existingUsername != null || existingEmail != null)
            throw new ConflictException("Username or email already exists");
    }
}