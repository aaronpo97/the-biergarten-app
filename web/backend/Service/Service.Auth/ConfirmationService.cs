
using Domain.Exceptions;
using Infrastructure.Repository.Auth;
using Service.Emails;

namespace Service.Auth;

/// <summary>
/// Handles confirmation of newly registered user accounts and resending of confirmation emails.
/// </summary>
/// <param name="authRepository">Repository used to look up and confirm user accounts.</param>
/// <param name="tokenService">Service used to generate and validate confirmation tokens.</param>
/// <param name="emailService">Service used to send confirmation-related emails.</param>
public class ConfirmationService(
    IAuthRepository authRepository,
    ITokenService tokenService,
    IEmailService emailService
) : IConfirmationService
{
    /// <summary>
    /// Validates a confirmation token and marks the corresponding user account as confirmed.
    /// </summary>
    /// <param name="confirmationToken">The confirmation token issued to the user, typically delivered via email.</param>
    /// <returns>
    /// A <see cref="ConfirmationServiceReturn"/> containing the UTC timestamp of confirmation and the confirmed user's ID.
    /// </returns>
    /// <exception cref="Domain.Exceptions.UnauthorizedException">
    /// Thrown when the confirmation token is invalid or expired, or when the associated user account cannot be found.
    /// </exception>
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

    /// <summary>
    /// Resends the account confirmation email to a user, generating a fresh confirmation token.
    /// </summary>
    /// <param name="userId">The unique identifier of the user requesting the resend.</param>
    /// <returns>A task that completes once the operation has finished.</returns>
    /// <remarks>
    /// Returns silently without sending an email if the user does not exist (to prevent user enumeration)
    /// or if the user's account is already verified.
    /// </remarks>
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
