namespace Infrastructure.Email;

/// <summary>
///     Service for sending emails.
/// </summary>
public interface IEmailProvider
{
    /// <summary>Sends an email to a single recipient.</summary>
    /// <param name="to">The recipient's email address.</param>
    /// <param name="subject">The email subject line.</param>
    /// <param name="body">The email body content.</param>
    /// <param name="isHtml">Whether <paramref name="body"/> is HTML; when <see langword="false"/> it is sent as plain text.</param>
    Task SendAsync(string to, string subject, string body, bool isHtml = true);

    /// <summary>Sends an email to multiple recipients.</summary>
    /// <param name="to">The recipients' email addresses.</param>
    /// <param name="subject">The email subject line.</param>
    /// <param name="body">The email body content.</param>
    /// <param name="isHtml">Whether <paramref name="body"/> is HTML; when <see langword="false"/> it is sent as plain text.</param>
    Task SendAsync(IEnumerable<string> to, string subject, string body, bool isHtml = true);
}
