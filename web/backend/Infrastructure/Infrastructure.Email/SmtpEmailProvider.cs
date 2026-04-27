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

    public async Task SendAsync(
        string to,
        string subject,
        string body,
        bool isHtml = true
    )
    {
        await SendAsync([to], subject, body, isHtml);
    }

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
