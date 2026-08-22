using Infrastructure.Email;
using Infrastructure.Email.Templates.Rendering;

namespace Features.Emails.Services;

/// <summary>
///     Default implementation of <see cref="IEmailDispatcher" />.
/// </summary>
public class EmailDispatcher(
    IEmailProvider emailProvider,
    IEmailTemplateProvider emailTemplateProvider
) : IEmailDispatcher
{
    /// <summary>
    ///     The base URL of the website, used to build confirmation links. Read from the
    ///     <c>WEBSITE_BASE_URL</c> environment variable.
    /// </summary>
    /// <exception cref="InvalidOperationException">
    ///     Thrown at type initialization time when the <c>WEBSITE_BASE_URL</c> environment variable is not set.
    /// </exception>
    private static readonly string WebsiteBaseUrl =
        Environment.GetEnvironmentVariable("WEBSITE_BASE_URL")
        ?? throw new InvalidOperationException("WEBSITE_BASE_URL environment variable is not set");

    /// <inheritdoc />
    public async Task SendRegistrationEmailAsync(
        string firstName,
        string email,
        string confirmationToken
    )
    {
        string confirmationLink = $"{WebsiteBaseUrl}/users/confirm?token={confirmationToken}";

        string emailHtml = await emailTemplateProvider.RenderUserRegisteredEmailAsync(
            firstName,
            confirmationLink
        );

        await emailProvider.SendAsync(email, "Welcome to The Biergarten App!", emailHtml);
    }

    /// <inheritdoc />
    public async Task SendResendConfirmationEmailAsync(
        string firstName,
        string email,
        string confirmationToken
    )
    {
        string confirmationLink = $"{WebsiteBaseUrl}/users/confirm?token={confirmationToken}";

        string emailHtml = await emailTemplateProvider.RenderResendConfirmationEmailAsync(
            firstName,
            confirmationLink
        );

        await emailProvider.SendAsync(
            email,
            "Confirm Your Email - The Biergarten App",
            emailHtml,
            true
        );
    }
}
