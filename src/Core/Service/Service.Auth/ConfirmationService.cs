
using Domain.Exceptions;
using Infrastructure.Repository.Auth;
using Service.Emails;

namespace Service.Auth;

public class ConfirmationService(
    IAuthRepository authRepository,
    ITokenService tokenService,
    IEmailService emailService
) : IConfirmationService
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

        return new ConfirmationServiceReturn(
            DateTime.UtcNow,
            user.UserAccountId
        );
    }

    public async Task ResendConfirmationEmailAsync(Guid userId)
    {
        var user = await authRepository.GetUserByIdAsync(userId);
        if (user == null)
        {
            return; // Silent return to prevent user enumeration
        }

        if (await authRepository.IsUserVerifiedAsync(userId))
        {
            return; // Already confirmed, no-op
        }

        var confirmationToken = tokenService.GenerateConfirmationToken(user);
        await emailService.SendResendConfirmationEmailAsync(user, confirmationToken);
    }
}
