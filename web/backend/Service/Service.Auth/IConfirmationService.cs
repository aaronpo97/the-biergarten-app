using Domain.Exceptions;
using Infrastructure.Repository.Auth;

namespace Service.Auth;

/// <summary>
/// Represents the result of successfully confirming a user account.
/// </summary>
/// <param name="ConfirmedAt">The UTC date and time at which the account was confirmed.</param>
/// <param name="UserId">The unique identifier of the confirmed user.</param>
public record ConfirmationServiceReturn(DateTime ConfirmedAt, Guid UserId);

/// <summary>
/// Defines operations for confirming user accounts and resending confirmation emails.
/// </summary>
public interface IConfirmationService
{
    /// <summary>
    /// Validates a confirmation token and confirms the corresponding user account.
    /// </summary>
    /// <param name="confirmationToken">The confirmation token issued to the user.</param>
    /// <returns>A <see cref="ConfirmationServiceReturn"/> describing the confirmed account.</returns>
    Task<ConfirmationServiceReturn> ConfirmUserAsync(string confirmationToken);

    /// <summary>
    /// Resends the account confirmation email for the specified user.
    /// </summary>
    /// <param name="userId">The unique identifier of the user requesting the resend.</param>
    /// <returns>A task that completes once the operation has finished.</returns>
    Task ResendConfirmationEmailAsync(Guid userId);

}
