namespace Features.Emails.Services;

/// <summary>
///     Defines operations for sending account-related emails.
/// </summary>
public interface IEmailDispatcher
{
    /// <summary>
    ///     Sends a welcome email containing an account confirmation link to a newly registered user.
    /// </summary>
    Task SendRegistrationEmailAsync(string firstName, string email, string confirmationToken);

    /// <summary>
    ///     Sends an email containing a fresh account confirmation link to a user who requested a resend.
    /// </summary>
    Task SendResendConfirmationEmailAsync(string firstName, string email, string confirmationToken);
}
