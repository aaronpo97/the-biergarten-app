namespace Infrastructure.Email;

/// <summary>
///     Service for sending emails via SMTP.
/// </summary>
public interface IEmailProvider
{
    /// <summary>
    ///     Sends an email to a single recipient.
    /// </summary>
    /// <param name="to">Recipient email address</param>
    /// <param name="subject">Email subject line</param>
    /// <param name="body">Email body (HTML or plain text)</param>
    /// <param name="isHtml">Whether the body is HTML (default: true)</param>
    Task SendAsync(string to, string subject, string body, bool isHtml = true);

    /// <summary>
    ///     Sends an email to multiple recipients.
    /// </summary>
    /// <param name="to">List of recipient email addresses</param>
    /// <param name="subject">Email subject line</param>
    /// <param name="body">Email body (HTML or plain text)</param>
    /// <param name="isHtml">Whether the body is HTML (default: true)</param>
    Task SendAsync(
        IEnumerable<string> to,
        string subject,
        string body,
        bool isHtml = true
    );
}