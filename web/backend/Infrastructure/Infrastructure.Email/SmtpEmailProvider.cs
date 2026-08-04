using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace Infrastructure.Email;

/// <summary>
///     SMTP email service implementation using MailKit.
///     Configured via environment variables.
/// </summary>
public class SmtpEmailProvider : IEmailProvider
{
    private readonly string _fromEmail;
    private readonly string _fromName;
    private readonly string _host;
    private readonly string? _password;
    private readonly int _port;
    private readonly string? _username;
    private readonly bool _useSsl;

    /// <summary>
    ///     Initializes a new instance of the <see cref="SmtpEmailProvider" /> class, reading SMTP configuration
    ///     from environment variables (<c>SMTP_HOST</c>, <c>SMTP_PORT</c>, <c>SMTP_USERNAME</c>,
    ///     <c>SMTP_PASSWORD</c>, <c>SMTP_USE_SSL</c>, <c>SMTP_FROM_EMAIL</c>, <c>SMTP_FROM_NAME</c>).
    /// </summary>
    /// <exception cref="InvalidOperationException">
    ///     Thrown when <c>SMTP_HOST</c> or <c>SMTP_FROM_EMAIL</c> is not set, or when <c>SMTP_PORT</c> is not a valid integer.
    /// </exception>
    public SmtpEmailProvider()
    {
        _host =
            Environment.GetEnvironmentVariable("SMTP_HOST")
            ?? throw new InvalidOperationException("SMTP_HOST environment variable is not set");

        string portString = Environment.GetEnvironmentVariable("SMTP_PORT") ?? "587";
        if (!int.TryParse(portString, out _port))
            throw new InvalidOperationException($"SMTP_PORT '{portString}' is not a valid integer");

        _username = Environment.GetEnvironmentVariable("SMTP_USERNAME");
        _password = Environment.GetEnvironmentVariable("SMTP_PASSWORD");

        string useSslString = Environment.GetEnvironmentVariable("SMTP_USE_SSL") ?? "true";
        _useSsl = bool.Parse(useSslString);

        _fromEmail =
            Environment.GetEnvironmentVariable("SMTP_FROM_EMAIL")
            ?? throw new InvalidOperationException(
                "SMTP_FROM_EMAIL environment variable is not set"
            );

        _fromName = Environment.GetEnvironmentVariable("SMTP_FROM_NAME") ?? "The Biergarten";
    }

    public async Task SendAsync(string to, string subject, string body, bool isHtml = true)
    {
        await SendAsync([to], subject, body, isHtml);
    }

    /// <summary>
    ///     Connects using StartTls when SSL is enabled (or no encryption otherwise), authenticates
    ///     if credentials were configured, sends the message, and disconnects.
    /// </summary>
    /// <exception cref="InvalidOperationException">
    ///     Thrown when connecting, authenticating, or sending via SMTP fails, wrapping the original exception.
    /// </exception>
    public async Task SendAsync(
        IEnumerable<string> to,
        string subject,
        string body,
        bool isHtml = true
    )
    {
        MimeMessage message = new();
        message.From.Add(new MailboxAddress(_fromName, _fromEmail));

        foreach (string recipient in to)
            message.To.Add(MailboxAddress.Parse(recipient));

        message.Subject = subject;

        BodyBuilder bodyBuilder = new();
        if (isHtml)
            bodyBuilder.HtmlBody = body;
        else
            bodyBuilder.TextBody = body;

        message.Body = bodyBuilder.ToMessageBody();

        using SmtpClient client = new();

        try
        {
            // Determine the SecureSocketOptions based on SSL setting
            SecureSocketOptions secureSocketOptions = _useSsl
                ? SecureSocketOptions.StartTls
                : SecureSocketOptions.None;

            await client.ConnectAsync(_host, _port, secureSocketOptions);

            // Authenticate if credentials are provided
            if (!string.IsNullOrEmpty(_username) && !string.IsNullOrEmpty(_password))
                await client.AuthenticateAsync(_username, _password);

            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to send email: {ex.Message}", ex);
        }
    }
}
