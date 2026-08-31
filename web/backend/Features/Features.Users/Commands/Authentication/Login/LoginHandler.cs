using Domain.Exceptions;
using Features.Auth.Dtos;
using Features.Auth.Identity;
using Features.Auth.Services;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Features.Auth.Commands.Authentication.Login;

/// <summary>
///     Handles <see cref="LoginCommand" /> by verifying credentials via
///     <see cref="UserManager{TUser}" /> and issuing access/refresh tokens.
/// </summary>
public class LoginHandler(UserManager<ApplicationUser> userManager, ITokenService tokenService)
    : IRequestHandler<LoginCommand, LoginPayload>
{
    /// <exception cref="UnauthorizedException">
    ///     Thrown when the username does not match any account or the supplied password does not match
    ///     the stored hash.
    /// </exception>
    public async Task<LoginPayload> Handle(
        LoginCommand request,
        CancellationToken cancellationToken
    )
    {
        ApplicationUser user =
            await userManager.FindByNameAsync(request.Username)
            ?? throw new UnauthorizedException("Invalid username or password.");

        if (!await userManager.CheckPasswordAsync(user, request.Password))
            throw new UnauthorizedException("Invalid username or password.");

        string accessToken = tokenService.GenerateAccessToken(user.Id, user.UserName);
        string refreshToken = tokenService.GenerateRefreshToken(user.Id, user.UserName);

        return new LoginPayload(user.Id, user.UserName, refreshToken, accessToken);
    }
}
