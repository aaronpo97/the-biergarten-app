using Domain.Entities;
using Infrastructure.Email;
using Infrastructure.Email.Templates.Rendering;

namespace Service.Emails;

/// <summary>
/// Defines operations for sending account-related emails, such as registration and confirmation resend emails.
/// </summary>
public interface IEmailService
{
    /// <summary>
    /// Sends a welcome email containing an account confirmation link to a newly registered user.
    /// </summary>
    /// <param name="createdUser">The newly created user account to email.</param>
    /// <param name="confirmationToken">The confirmation token to embed in the confirmation link.</param>
    /// <returns>A task that completes once the email has been sent.</returns>
    public Task SendRegistrationEmailAsync(
        UserAccount createdUser,
        string confirmationToken
    );

    /// <summary>
    /// Sends an email containing a fresh account confirmation link to a user who requested a resend.
    /// </summary>
    /// <param name="user">The user account to email.</param>
    /// <param name="confirmationToken">The confirmation token to embed in the confirmation link.</param>
    /// <returns>A task that completes once the email has been sent.</returns>
    public Task SendResendConfirmationEmailAsync(
        UserAccount user,
        string confirmationToken
    );
}

/// <summary>
/// Default implementation of <see cref="IEmailService"/> that renders email templates and dispatches
/// them via an <see cref="IEmailProvider"/>.
/// </summary>
/// <param name="emailProvider">Provider used to deliver the rendered emails.</param>
/// <param name="emailTemplateProvider">Provider used to render HTML email bodies from templates.</param>
public class EmailService(
    IEmailProvider emailProvider,
    IEmailTemplateProvider emailTemplateProvider
) : IEmailService
{
    /// <summary>
    /// The base URL of the website, used to build confirmation links. Read from the
    /// <c>WEBSITE_BASE_URL</c> environment variable.
    /// </summary>
    /// <exception cref="InvalidOperationException">
    /// Thrown at type initialization time when the <c>WEBSITE_BASE_URL</c> environment variable is not set.
    /// </exception>
    private static readonly string WebsiteBaseUrl =
        Environment.GetEnvironmentVariable("WEBSITE_BASE_URL")
        ?? throw new InvalidOperationException("WEBSITE_BASE_URL environment variable is not set");

    /// <summary>
    /// Builds a confirmation link from the given token, renders the registration welcome email template,
    /// and sends it to the newly created user.
    /// </summary>
    /// <param name="createdUser">The newly created user account to email.</param>
    /// <param name="confirmationToken">The confirmation token to embed in the confirmation link.</param>
    /// <returns>A task that completes once the email has been sent.</returns>
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

    /// <summary>
    /// Builds a confirmation link from the given token, renders the resend-confirmation email template,
    /// and sends it to the user.
    /// </summary>
    /// <param name="user">The user account to email.</param>
    /// <param name="confirmationToken">The confirmation token to embed in the confirmation link.</param>
    /// <returns>A task that completes once the email has been sent.</returns>
    public async Task SendResendConfirmationEmailAsync(
        UserAccount user,
        string confirmationToken
    )
    {
        var confirmationLink =
            $"{WebsiteBaseUrl}/users/confirm?token={confirmationToken}";

        var emailHtml =
            await emailTemplateProvider.RenderResendConfirmationEmailAsync(
                user.FirstName,
                confirmationLink
            );

        await emailProvider.SendAsync(
            user.Email,
            "Confirm Your Email - The Biergarten App",
            emailHtml,
            isHtml: true
        );
    }
}
