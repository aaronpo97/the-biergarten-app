using Domain.Entities;
using Domain.Exceptions;
using Features.Auth.Dtos;
using Features.Auth.Repository;
using Features.Auth.Services;
using MediatR;

namespace Features.Auth.Commands.ConfirmUser;

/// <summary>
///     Handles <see cref="ConfirmUserCommand" /> by validating the confirmation token and marking the
///     corresponding user account as confirmed.
/// </summary>
public class ConfirmUserHandler(IAuthRepository authRepository, ITokenService tokenService)
    : IRequestHandler<ConfirmUserCommand, ConfirmationPayload>
{
    /// <exception cref="UnauthorizedException">
    ///     Thrown when the confirmation token is invalid or expired, or when the associated user account cannot be found.
    /// </exception>
    public async Task<ConfirmationPayload> Handle(
        ConfirmUserCommand request,
        CancellationToken cancellationToken
    )
    {
        ValidatedToken validatedToken = await tokenService.ValidateConfirmationTokenAsync(
            request.Token
        );

        UserAccount? user = await authRepository.ConfirmUserAccountAsync(validatedToken.UserId);

        if (user == null)
            throw new UnauthorizedException("User account not found");

        return new ConfirmationPayload(user.UserAccountId, DateTime.UtcNow);
    }
}
