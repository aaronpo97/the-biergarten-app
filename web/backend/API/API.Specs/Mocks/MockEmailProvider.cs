using Infrastructure.Email;

namespace API.Specs.Mocks;

/// <summary>
///     Mock email provider for testing that doesn't actually send emails.
///     Tracks sent emails for verification in tests if needed.
/// </summary>
public class MockEmailProvider : IEmailProvider
{
    public List<SentEmail> SentEmails { get; } = new();

    public Task SendAsync(string to, string subject, string body, bool isHtml = true)
    {
        SentEmails.Add(
            new SentEmail
            {
                To = [to],
                Subject = subject,
                Body = body,
                IsHtml = isHtml,
                SentAt = DateTime.UtcNow,
            }
        );

        return Task.CompletedTask;
    }

    public Task SendAsync(IEnumerable<string> to, string subject, string body, bool isHtml = true)
    {
        SentEmails.Add(
            new SentEmail
            {
                To = to.ToList(),
                Subject = subject,
                Body = body,
                IsHtml = isHtml,
                SentAt = DateTime.UtcNow,
            }
        );

        return Task.CompletedTask;
    }

    public void Clear()
    {
        SentEmails.Clear();
    }

    public class SentEmail
    {
        public List<string> To { get; init; } = new();
        public string Subject { get; init; } = string.Empty;
        public string Body { get; init; } = string.Empty;
        public bool IsHtml { get; init; }
        public DateTime SentAt { get; init; }
    }
}
