using Domain.Entities;
using Domain.Exceptions;
using Features.Auth.Dtos;
using Features.Auth.Repository;
using Features.Auth.Services;
using Infrastructure.PasswordHashing;
using MediatR;

namespace Features.Auth.Commands.Login;

/// <summary>
///     Handles <see cref="LoginCommand" /> by verifying credentials and issuing access/refresh tokens.
/// </summary>
public class LoginHandler(
    IAuthRepository authRepo,
    IPasswordInfrastructure passwordInfrastructure,
    ITokenService tokenService
) : IRequestHandler<LoginCommand, LoginPayload>
{
    /// <exception cref="UnauthorizedException">
    ///     Thrown when the username does not match any account, the account has no active credential,
    ///     or the supplied password does not match the stored hash.
    /// </exception>
    public async Task<LoginPayload> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        UserAccount user =
            await authRepo.GetUserByUsernameAsync(request.Username)
            ?? throw new UnauthorizedException("Invalid username or password.");

        // @todo handle expired passwords
        UserCredential activeCred =
            await authRepo.GetActiveCredentialByUserAccountIdAsync(user.UserAccountId)
            ?? throw new UnauthorizedException("Invalid username or password.");

        if (!passwordInfrastructure.Verify(request.Password, activeCred.Hash))
            throw new UnauthorizedException("Invalid username or password.");

        string accessToken = tokenService.GenerateAccessToken(user);
        string refreshToken = tokenService.GenerateRefreshToken(user);

        return new LoginPayload(user.UserAccountId, user.Username, refreshToken, accessToken);
    }
}
