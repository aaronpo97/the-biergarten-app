using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace Infrastructure.Email;

/// <summary>
/// SMTP email service implementation using MailKit.
/// Configured via environment variables.
/// </summary>
public class SmtpEmailProvider : IEmailProvider
{
    private readonly string _host;
    private readonly int _port;
    private readonly string? _username;
    private readonly string? _password;
    private readonly bool _useSsl;
    private readonly string _fromEmail;
    private readonly string _fromName;

    /// <summary>
    /// Initializes a new instance of <see cref="SmtpEmailProvider"/>, reading SMTP configuration
    /// from environment variables.
    /// </summary>
    /// <remarks>
    /// Reads the following environment variables:
    /// <list type="bullet">
    /// <item><description><c>SMTP_HOST</c> (required) - the SMTP server hostname.</description></item>
    /// <item><description><c>SMTP_PORT</c> (optional, default "587") - the SMTP server port, must be a valid integer.</description></item>
    /// <item><description><c>SMTP_USERNAME</c> (optional) - the username used for authentication.</description></item>
    /// <item><description><c>SMTP_PASSWORD</c> (optional) - the password used for authentication.</description></item>
    /// <item><description><c>SMTP_USE_SSL</c> (optional, default "true") - whether to use StartTls when connecting.</description></item>
    /// <item><description><c>SMTP_FROM_EMAIL</c> (required) - the email address used as the sender.</description></item>
    /// <item><description><c>SMTP_FROM_NAME</c> (optional, default "The Biergarten") - the display name used as the sender.</description></item>
    /// </list>
    /// </remarks>
    /// <exception cref="InvalidOperationException">
    /// Thrown when <c>SMTP_HOST</c> or <c>SMTP_FROM_EMAIL</c> is not set, or when <c>SMTP_PORT</c> is not a valid integer.
    /// </exception>
    public SmtpEmailProvider()
    {
        _host =
            Environment.GetEnvironmentVariable("SMTP_HOST")
            ?? throw new InvalidOperationException(
                "SMTP_HOST environment variable is not set"
            );

        var portString =
            Environment.GetEnvironmentVariable("SMTP_PORT") ?? "587";
        if (!int.TryParse(portString, out _port))
        {
            throw new InvalidOperationException(
                $"SMTP_PORT '{portString}' is not a valid integer"
            );
        }

        _username = Environment.GetEnvironmentVariable("SMTP_USERNAME");
        _password = Environment.GetEnvironmentVariable("SMTP_PASSWORD");

        var useSslString =
            Environment.GetEnvironmentVariable("SMTP_USE_SSL") ?? "true";
        _useSsl = bool.Parse(useSslString);

        _fromEmail =
            Environment.GetEnvironmentVariable("SMTP_FROM_EMAIL")
            ?? throw new InvalidOperationException(
                "SMTP_FROM_EMAIL environment variable is not set"
            );

        _fromName =
            Environment.GetEnvironmentVariable("SMTP_FROM_NAME")
            ?? "The Biergarten";
    }

    /// <summary>
    /// Sends an email to a single recipient by delegating to the multi-recipient overload.
    /// </summary>
    /// <param name="to">Recipient email address</param>
    /// <param name="subject">Email subject line</param>
    /// <param name="body">Email body (HTML or plain text)</param>
    /// <param name="isHtml">Whether the body is HTML (default: true)</param>
    /// <exception cref="InvalidOperationException">Thrown when connecting, authenticating, or sending via SMTP fails.</exception>
    public async Task SendAsync(
        string to,
        string subject,
        string body,
        bool isHtml = true
    )
    {
        await SendAsync([to], subject, body, isHtml);
    }

    /// <summary>
    /// Sends an email to multiple recipients using MailKit's <see cref="SmtpClient"/>.
    /// Connects using StartTls when SSL is enabled (or no encryption otherwise), authenticates
    /// if credentials were configured, sends the message, and disconnects.
    /// </summary>
    /// <param name="to">List of recipient email addresses</param>
    /// <param name="subject">Email subject line</param>
    /// <param name="body">Email body (HTML or plain text)</param>
    /// <param name="isHtml">Whether the body is HTML (default: true)</param>
    /// <exception cref="InvalidOperationException">Thrown when connecting, authenticating, or sending via SMTP fails. The original exception is included as the inner exception.</exception>
    public async Task SendAsync(
        IEnumerable<string> to,
        string subject,
        string body,
        bool isHtml = true
    )
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_fromName, _fromEmail));

        foreach (var recipient in to)
        {
            message.To.Add(MailboxAddress.Parse(recipient));
        }

        message.Subject = subject;

        var bodyBuilder = new BodyBuilder();
        if (isHtml)
        {
            bodyBuilder.HtmlBody = body;
        }
        else
        {
            bodyBuilder.TextBody = body;
        }

        message.Body = bodyBuilder.ToMessageBody();

        using var client = new SmtpClient();

        try
        {
            // Determine the SecureSocketOptions based on SSL setting
            var secureSocketOptions = _useSsl
                ? SecureSocketOptions.StartTls
                : SecureSocketOptions.None;

            await client.ConnectAsync(_host, _port, secureSocketOptions);

            // Authenticate if credentials are provided
            if (
                !string.IsNullOrEmpty(_username)
                && !string.IsNullOrEmpty(_password)
            )
            {
                await client.AuthenticateAsync(_username, _password);
            }

            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException(
                $"Failed to send email: {ex.Message}",
                ex
            );
        }
    }
}
