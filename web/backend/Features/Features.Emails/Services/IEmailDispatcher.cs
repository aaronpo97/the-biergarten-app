namespace Features.Emails.Services;

/// <summary>
///     Defines operations for sending account-related emails.
/// </summary>
public interface IEmailDispatcher
{
    /// <summary>
    ///     Sends a welcome email containing an account confirmation link to a newly registered user.
    /// </summary>
    /// <remarks>The email is sent synchronously; the returned task completes once delivery to the mail server succeeds or fails.</remarks>
    /// <param name="confirmationToken">Embedded in the confirmation link sent to <paramref name="email" />.</param>
    Task SendRegistrationEmailAsync(string firstName, string email, string confirmationToken);

    /// <summary>
    ///     Sends an email containing a fresh account confirmation link to a user who requested a resend.
    /// </summary>
    /// <remarks>The email is sent synchronously; the returned task completes once delivery to the mail server succeeds or fails.</remarks>
    /// <param name="confirmationToken">Embedded in the confirmation link sent to <paramref name="email" />.</param>
    Task SendResendConfirmationEmailAsync(string firstName, string email, string confirmationToken);
}
