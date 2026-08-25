using Infrastructure.Configuration;
using Infrastructure.Email;
using Infrastructure.Email.Templates.Rendering;
using Microsoft.Extensions.Configuration;

namespace Features.Emails.Services;

/// <summary>
///     Default implementation of <see cref="IEmailDispatcher" />.
/// </summary>
public class EmailDispatcher(
    IEmailProvider emailProvider,
    IEmailTemplateProvider emailTemplateProvider,
    IConfiguration configuration
) : IEmailDispatcher
{
    /// <summary>
    ///     The base URL of the website, used to build confirmation links. Read from the
    ///     <c>WEBSITE_BASE_URL</c> configuration value.
    /// </summary>
    /// <exception cref="InvalidOperationException">
    ///     Thrown when the <c>WEBSITE_BASE_URL</c> configuration value is not set.
    /// </exception>
    private string WebsiteBaseUrl =>
        ConfigurationHelpers.GetKeyOrThrow(configuration, ConfigurationKeys.WebsiteBaseUrl);

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
