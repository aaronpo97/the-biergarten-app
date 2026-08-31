using Domain.Entities;
using Domain.Exceptions;
using Features.Auth.Commands.CreateUserProfile;
using Features.Auth.Dtos;
using Features.Auth.Identity;
using Features.Auth.Services;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Shared.Application.Emails;

namespace Features.Auth.Commands.RegisterUser;

/// <summary>
///     Handles <see cref="RegisterUserCommand" />: creates the user via <see cref="UserManager{TUser}" />
///     (which validates uniqueness and hashes the password), issues access/refresh/confirmation tokens, and
///     attempts to send the registration confirmation email via Features.Emails.
/// </summary>
public class RegisterUserHandler(
    UserManager<ApplicationUser> userManager,
    ITokenService tokenService,
    IMediator mediator
) : IRequestHandler<RegisterUserCommand, RegistrationPayload>
{
    /// <exception cref="ConflictException">
    ///     Thrown when an existing account already has the same username or email address, or when user
    ///     creation otherwise fails.
    /// </exception>
    public async Task<RegistrationPayload> Handle(
        RegisterUserCommand request,
        CancellationToken cancellationToken
    )
    {
        ApplicationUser user = new UserAccount
        {
            Username = request.Username,
            Email = request.Email,
            FirstName = request.FirstName,
            LastName = request.LastName,
            DateOfBirth = request.DateOfBirth,
        }.ToApplicationUser();

        IdentityResult result = await userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            if (result.Errors.Any(e => e.Code is "DuplicateUserName" or "DuplicateEmail"))
                throw new ConflictException("Username or email already exists");
            throw new ConflictException(
                string.Join("; ", result.Errors.Select(e => e.Description))
            );
        }

        await mediator.Send(new CreateUserProfileCommand(user.Id, string.Empty), cancellationToken);

        string accessToken = tokenService.GenerateAccessToken(user.Id, user.UserName);
        string refreshToken = tokenService.GenerateRefreshToken(user.Id, user.UserName);
        string confirmationToken = tokenService.GenerateConfirmationToken(user.Id, user.UserName);

        if (string.IsNullOrEmpty(accessToken) || string.IsNullOrEmpty(refreshToken))
            return new RegistrationPayload(
                user.Id,
                user.UserName,
                string.Empty,
                string.Empty,
                false
            );

        bool emailSent = false;
        try
        {
            await mediator.Send(
                new SendRegistrationEmailCommand(user.FirstName, user.Email, confirmationToken),
                cancellationToken
            );
            emailSent = true;
        }
        catch (Exception ex)
        {
            await Console.Error.WriteLineAsync(ex.Message);
            Console.WriteLine("Could not send email.");
        }

        return new RegistrationPayload(
            user.Id,
            user.UserName,
            refreshToken,
            accessToken,
            emailSent
        );
    }
}
