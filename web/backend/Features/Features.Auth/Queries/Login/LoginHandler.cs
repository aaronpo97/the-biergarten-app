using Domain.Entities;
using Domain.Exceptions;
using Features.Auth.Dtos;
using Features.Auth.Repository;
using Features.Auth.Services;
using Infrastructure.PasswordHashing;
using MediatR;

namespace Features.Auth.Queries.Login;

/// <summary>
///     Handles <see cref="LoginQuery" /> by verifying credentials and issuing access/refresh tokens.
/// </summary>
/// <param name="authRepo">Repository used to look up the user account and its active credential.</param>
/// <param name="passwordInfrastructure">
///     Infrastructure component used to verify a plain-text password against a stored
///     hash.
/// </param>
/// <param name="tokenService">Service used to generate access and refresh tokens for the authenticated user.</param>
public class LoginHandler(
    IAuthRepository authRepo,
    IPasswordInfrastructure passwordInfrastructure,
    ITokenService tokenService
) : IRequestHandler<LoginQuery, LoginPayload>
{
    /// <exception cref="UnauthorizedException">
    ///     Thrown when the username does not match any account, the account has no active credential,
    ///     or the supplied password does not match the stored hash.
    /// </exception>
    public async Task<LoginPayload> Handle(LoginQuery request, CancellationToken cancellationToken)
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
