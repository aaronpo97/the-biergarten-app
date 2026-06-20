namespace Features.Emails.Services;

/// <summary>
///     Defines operations for sending account-related emails, such as registration and confirmation resend emails.
/// </summary>
public interface IEmailDispatcher
{
    /// <summary>
    ///     Sends a welcome email containing an account confirmation link to a newly registered user.
    /// </summary>
    /// <param name="firstName">The recipient's first name, used to personalize the email.</param>
    /// <param name="email">The recipient's email address.</param>
    /// <param name="confirmationToken">The confirmation token to embed in the confirmation link.</param>
    /// <returns>A task that completes once the email has been sent.</returns>
    Task SendRegistrationEmailAsync(string firstName, string email, string confirmationToken);

    /// <summary>
    ///     Sends an email containing a fresh account confirmation link to a user who requested a resend.
    /// </summary>
    /// <param name="firstName">The recipient's first name, used to personalize the email.</param>
    /// <param name="email">The recipient's email address.</param>
    /// <param name="confirmationToken">The confirmation token to embed in the confirmation link.</param>
    /// <returns>A task that completes once the email has been sent.</returns>
    Task SendResendConfirmationEmailAsync(string firstName, string email, string confirmationToken);
}
