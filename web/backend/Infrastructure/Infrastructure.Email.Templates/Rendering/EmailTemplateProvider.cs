using Infrastructure.Email.Templates.Mail;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.AspNetCore.Components.Web.HtmlRendering;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Email.Templates.Rendering;

/// <summary>
///     Service for rendering Razor email templates to HTML using HtmlRenderer.
/// </summary>
public class EmailTemplateProvider(IServiceProvider serviceProvider, ILoggerFactory loggerFactory)
    : IEmailTemplateProvider
{
    public async Task<string> RenderUserRegisteredEmailAsync(
        string username,
        string confirmationLink
    )
    {
        Dictionary<string, object?> parameters = new()
        {
            { nameof(UserRegistration.Username), username },
            { nameof(UserRegistration.ConfirmationLink), confirmationLink },
        };

        return await RenderComponentAsync<UserRegistration>(parameters);
    }

    public async Task<string> RenderResendConfirmationEmailAsync(
        string username,
        string confirmationLink
    )
    {
        Dictionary<string, object?> parameters = new()
        {
            { nameof(ResendConfirmation.Username), username },
            { nameof(ResendConfirmation.ConfirmationLink), confirmationLink },
        };

        return await RenderComponentAsync<ResendConfirmation>(parameters);
    }

    /// <summary>
    ///     Creates a scoped <see cref="HtmlRenderer" />, dispatches the render onto its renderer thread,
    ///     and returns the resulting HTML string.
    /// </summary>
    private async Task<string> RenderComponentAsync<TComponent>(
        Dictionary<string, object?> parameters
    )
        where TComponent : IComponent
    {
        await using HtmlRenderer htmlRenderer = new(serviceProvider, loggerFactory);

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
