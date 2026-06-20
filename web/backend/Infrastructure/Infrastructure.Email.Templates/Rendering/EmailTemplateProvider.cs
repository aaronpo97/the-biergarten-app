using Infrastructure.Email.Templates.Mail;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.Web.HtmlRendering;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Email.Templates.Rendering;

/// <summary>
///     Service for rendering Razor email templates to HTML using HtmlRenderer.
/// </summary>
/// <param name="serviceProvider">
///     The service provider used to resolve dependencies for the Razor component rendering
///     pipeline.
/// </param>
/// <param name="loggerFactory">The logger factory passed to the <see cref="HtmlRenderer" /> used to render components.</param>
public class EmailTemplateProvider(
    IServiceProvider serviceProvider,
    ILoggerFactory loggerFactory
) : IEmailTemplateProvider
{
    /// <summary>
    ///     Renders the UserRegisteredEmail template with the specified parameters.
    /// </summary>
    /// <param name="username">The username to include in the email</param>
    /// <param name="confirmationLink">The email confirmation link</param>
    /// <returns>The rendered HTML string</returns>
    public async Task<string> RenderUserRegisteredEmailAsync(
        string username,
        string confirmationLink
    )
    {
        Dictionary<string, object?> parameters = new()
        {
            { nameof(UserRegistration.Username), username },
            { nameof(UserRegistration.ConfirmationLink), confirmationLink }
        };

        return await RenderComponentAsync<UserRegistration>(parameters);
    }

    /// <summary>
    ///     Renders the ResendConfirmation template with the specified parameters.
    /// </summary>
    /// <param name="username">The username to include in the email</param>
    /// <param name="confirmationLink">The new confirmation link</param>
    /// <returns>The rendered HTML string</returns>
    public async Task<string> RenderResendConfirmationEmailAsync(
        string username,
        string confirmationLink
    )
    {
        Dictionary<string, object?> parameters = new()
        {
            { nameof(ResendConfirmation.Username), username },
            { nameof(ResendConfirmation.ConfirmationLink), confirmationLink }
        };

        return await RenderComponentAsync<ResendConfirmation>(parameters);
    }

    /// <summary>
    ///     Generic method to render any Razor component to HTML.
    ///     Creates a scoped <see cref="HtmlRenderer" />, dispatches the render onto its renderer thread,
    ///     and returns the resulting HTML string.
    /// </summary>
    /// <typeparam name="TComponent">The type of the Razor component to render.</typeparam>
    /// <param name="parameters">A dictionary of parameter names and values to pass to the component.</param>
    /// <returns>The rendered HTML string for the component.</returns>
    private async Task<string> RenderComponentAsync<TComponent>(
        Dictionary<string, object?> parameters
    )
        where TComponent : IComponent
    {
        await using HtmlRenderer htmlRenderer = new(
            serviceProvider,
            loggerFactory
        );

        string html = await htmlRenderer.Dispatcher.InvokeAsync(async () =>
        {
            ParameterView parameterView = ParameterView.FromDictionary(parameters);
            HtmlRootComponent output = await htmlRenderer.RenderComponentAsync<TComponent>(
                parameterView
            );

            return output.ToHtmlString();
        });

        return html;
    }
}