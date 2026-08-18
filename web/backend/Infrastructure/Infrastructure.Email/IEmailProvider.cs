namespace Infrastructure.Email;

/// <summary>
///     Service for sending emails.
/// </summary>
public interface IEmailProvider
{
    Task SendAsync(string to, string subject, string body, bool isHtml = true);

    Task SendAsync(IEnumerable<string> to, string subject, string body, bool isHtml = true);
}
