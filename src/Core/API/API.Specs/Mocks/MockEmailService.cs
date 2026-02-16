using Domain.Entities;
using Service.Emails;

namespace API.Specs.Mocks;

public class MockEmailService : IEmailService
{
    public List<RegistrationEmail> SentRegistrationEmails { get; } = new();

    public Task SendRegistrationEmailAsync(
        UserAccount createdUser,
        string confirmationToken
    )
    {
        SentRegistrationEmails.Add(
            new RegistrationEmail
            {
                UserAccount = createdUser,
                ConfirmationToken = confirmationToken,
                SentAt = DateTime.UtcNow,
            }
        );

        return Task.CompletedTask;
    }

    public void Clear()
    {
        SentRegistrationEmails.Clear();
    }

    public class RegistrationEmail
    {
        public UserAccount UserAccount { get; init; } = null!;
        public string ConfirmationToken { get; init; } = string.Empty;
        public DateTime SentAt { get; init; }
    }
}
