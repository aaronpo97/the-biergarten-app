using Domain.Exceptions;
using Infrastructure.Repository.Auth;

namespace Service.Auth;

public record ConfirmationServiceReturn(DateTime ConfirmedAt, Guid UserId);

public interface IConfirmationService
{
    Task<ConfirmationServiceReturn> ConfirmUserAsync(string confirmationToken);
}

public class ConfirmationService(IAuthRepository authRepository, ITokenService tokenService)
    : IConfirmationService
{
    public async Task<ConfirmationServiceReturn> ConfirmUserAsync(
        string confirmationToken
    )
    {
        var validatedToken = await tokenService.ValidateConfirmationTokenAsync(
            confirmationToken
        );

        var user = await authRepository.ConfirmUserAccountAsync(
            validatedToken.UserId
        );

        if (user == null)
        {
            throw new UnauthorizedException("User account not found");
        }

        return new ConfirmationServiceReturn(DateTime.UtcNow, user.UserAccountId);
    }
}
