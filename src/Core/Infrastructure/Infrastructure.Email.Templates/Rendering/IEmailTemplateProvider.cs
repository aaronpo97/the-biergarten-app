namespace Infrastructure.Email.Templates.Rendering;

/// <summary>
/// Service for rendering Razor email templates to HTML.
/// </summary>
public interface IEmailTemplateProvider
{
    /// <summary>
    /// Renders the UserRegisteredEmail template with the specified parameters.
    /// </summary>
    /// <param name="username">The username to include in the email</param>
    /// <param name="confirmationLink">The email confirmation link</param>
    /// <returns>The rendered HTML string</returns>
    Task<string> RenderUserRegisteredEmailAsync(
        string username,
        string confirmationLink
    );
}
