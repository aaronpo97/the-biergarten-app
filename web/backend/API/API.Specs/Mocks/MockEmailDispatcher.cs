using Features.Emails.Services;

namespace API.Specs.Mocks;

public class MockEmailDispatcher : IEmailDispatcher
{
    public List<RegistrationEmail> SentRegistrationEmails { get; } = new();

    public List<ResendConfirmationEmail> SentResendConfirmationEmails { get; } = new();

    public Task SendRegistrationEmailAsync(
        string firstName,
        string email,
        string confirmationToken
    )
    {
        SentRegistrationEmails.Add(
            new RegistrationEmail
            {
                FirstName = firstName,
                Email = email,
                ConfirmationToken = confirmationToken,
                SentAt = DateTime.UtcNow,
            }
        );

        return Task.CompletedTask;
    }

    public Task SendResendConfirmationEmailAsync(
        string firstName,
        string email,
        string confirmationToken
    )
    {
        SentResendConfirmationEmails.Add(
            new ResendConfirmationEmail
            {
                FirstName = firstName,
                Email = email,
                ConfirmationToken = confirmationToken,
                SentAt = DateTime.UtcNow,
            }
        );

        return Task.CompletedTask;
    }

    public void Clear()
    {
        SentRegistrationEmails.Clear();
        SentResendConfirmationEmails.Clear();
    }

    public class RegistrationEmail
    {
        public string FirstName { get; init; } = string.Empty;
        public string Email { get; init; } = string.Empty;
        public string ConfirmationToken { get; init; } = string.Empty;
        public DateTime SentAt { get; init; }
    }

    public class ResendConfirmationEmail
    {
        public string FirstName { get; init; } = string.Empty;
        public string Email { get; init; } = string.Empty;
        public string ConfirmationToken { get; init; } = string.Empty;
        public DateTime SentAt { get; init; }
    }
}
