using Domain.Entities;
using Infrastructure.Email;
using Infrastructure.Email.Templates.Rendering;

namespace Service.Emails;

public interface IEmailService
{
    public Task SendRegistrationEmailAsync(UserAccount createdUser, string confirmationToken);
}

public class EmailService(
    IEmailProvider emailProvider,
    IEmailTemplateProvider emailTemplateProvider) : IEmailService
{
    public async Task SendRegistrationEmailAsync(UserAccount createdUser, string confirmationToken)
    {
        var confirmationLink = $"https://thebiergarten.app/confirm?token={confirmationToken}";

        var emailHtml = await emailTemplateProvider.RenderUserRegisteredEmailAsync(
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
