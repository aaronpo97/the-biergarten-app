namespace Infrastructure.Email.Templates.Rendering;

/// <summary>
///     Service for rendering Razor email templates to HTML.
/// </summary>
public interface IEmailTemplateProvider
{
    /// <summary>Renders the registration confirmation email template.</summary>
    /// <param name="username">The recipient's username, shown in the greeting.</param>
    /// <param name="confirmationLink">The URL the recipient follows to confirm their account.</param>
    /// <returns>A task whose result is the rendered HTML for the email body.</returns>
    Task<string> RenderUserRegisteredEmailAsync(string username, string confirmationLink);

    /// <summary>Renders the resend-confirmation email template.</summary>
    /// <param name="username">The recipient's username, shown in the greeting.</param>
    /// <param name="confirmationLink">The URL the recipient follows to confirm their account.</param>
    /// <returns>A task whose result is the rendered HTML for the email body.</returns>
    Task<string> RenderResendConfirmationEmailAsync(string username, string confirmationLink);
}
