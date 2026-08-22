using Domain.Exceptions;
using Features.Auth.Dtos;
using Features.Auth.Identity;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Features.Auth.Commands.UpdateUsername;

/// <summary>Handles <see cref="UpdateUsernameCommand" /> via <see cref="UserManager{TUser}" />.</summary>
public class UpdateUsernameHandler(UserManager<ApplicationUser> userManager)
    : IRequestHandler<UpdateUsernameCommand, UpdateUsernamePayload>
{
    /// <exception cref="NotFoundException">Thrown when the account does not exist.</exception>
    /// <exception cref="ConflictException">Thrown when the requested username is already taken.</exception>
    public async Task<UpdateUsernamePayload> Handle(
        UpdateUsernameCommand request,
        CancellationToken cancellationToken
    )
    {
        ApplicationUser user =
            await userManager.FindByIdAsync(request.UserAccountId.ToString())
            ?? throw new NotFoundException("User account not found");

        IdentityResult result = await userManager.SetUserNameAsync(user, request.NewUsername);
        if (!result.Succeeded)
        {
            if (result.Errors.Any(e => e.Code == "DuplicateUserName"))
                throw new ConflictException("Username already exists");
            throw new ConflictException(string.Join("; ", result.Errors.Select(e => e.Description)));
        }

        return new UpdateUsernamePayload(user.Id, user.UserName);
    }
}
