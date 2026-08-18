namespace Infrastructure.Email.Templates.Rendering;

/// <summary>
///     Service for rendering Razor email templates to HTML.
/// </summary>
public interface IEmailTemplateProvider
{
    /// <summary>
    ///     Renders the UserRegisteredEmail template.
    /// </summary>
    Task<string> RenderUserRegisteredEmailAsync(string username, string confirmationLink);

    /// <summary>
    ///     Renders the ResendConfirmation template.
    /// </summary>
    Task<string> RenderResendConfirmationEmailAsync(string username, string confirmationLink);
}
