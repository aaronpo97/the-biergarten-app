using Domain.Entities;
using Infrastructure.Email;
using Infrastructure.Email.Templates.Rendering;

namespace Service.Emails;

public interface IEmailService
{
    public Task SendRegistrationEmailAsync(
        UserAccount createdUser,
        string confirmationToken
    );
}

public class EmailService(
    IEmailProvider emailProvider,
    IEmailTemplateProvider emailTemplateProvider
) : IEmailService
{
    private static readonly string WebsiteBaseUrl =
        Environment.GetEnvironmentVariable("WEBSITE_BASE_URL")
        ?? throw new InvalidOperationException("WEBSITE_BASE_URL environment variable is not set");

    public async Task SendRegistrationEmailAsync(
        UserAccount createdUser,
        string confirmationToken
    )
    {
        var confirmationLink =
            $"{WebsiteBaseUrl}/users/confirm?token={confirmationToken}";

        var emailHtml =
            await emailTemplateProvider.RenderUserRegisteredEmailAsync(
                createdUser.FirstName,
                confirmationLink
            );

        await emailProvider.SendAsync(
            createdUser.Email,
            "Welcome to The Biergarten App!",
            emailHtml,
            isHtml: true
        );
    }
}
