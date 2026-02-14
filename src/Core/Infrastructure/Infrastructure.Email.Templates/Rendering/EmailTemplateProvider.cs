using Infrastructure.Email.Templates.Mail;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Web;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Email.Templates.Rendering;

/// <summary>
/// Service for rendering Razor email templates to HTML using HtmlRenderer.
/// </summary>
public class EmailTemplateProvider(IServiceProvider serviceProvider, ILoggerFactory loggerFactory)
    : IEmailTemplateProvider
{
    /// <summary>
   /// Renders the UserRegisteredEmail template with the specified parameters.
   /// </summary>
   public async Task<string> RenderUserRegisteredEmailAsync(string username, string confirmationLink)
   {
      var parameters = new Dictionary<string, object?>
        {
            { nameof(UserRegistration.Username), username },
            { nameof(UserRegistration.ConfirmationLink), confirmationLink }
        };

      return await RenderComponentAsync<UserRegistration>(parameters);
   }

   /// <summary>
   /// Generic method to render any Razor component to HTML.
   /// </summary>
   private async Task<string> RenderComponentAsync<TComponent>(Dictionary<string, object?> parameters)
       where TComponent : IComponent
   {
      await using var htmlRenderer = new HtmlRenderer(serviceProvider, loggerFactory);

      var html = await htmlRenderer.Dispatcher.InvokeAsync(async () =>
      {
         var parameterView = ParameterView.FromDictionary(parameters);
         var output = await htmlRenderer.RenderComponentAsync<TComponent>(parameterView);

         return output.ToHtmlString();
      });

      return html;
   }
}
