using Features.Emails.Services;
using Infrastructure.Email;
using Infrastructure.Email.Templates.Rendering;
using Microsoft.Extensions.DependencyInjection;

namespace Features.Emails.DependencyInjection;

/// <summary>
///     Registers the services used by the Features.Emails slice.
/// </summary>
public static class FeaturesEmailsServiceCollectionExtensions
{
    /// <summary>
    ///     Registers the SMTP email provider, template renderer, and <see cref="IEmailDispatcher" />.
    /// </summary>
    /// <returns>The same <paramref name="services" /> instance, for chaining.</returns>
    public static IServiceCollection AddFeaturesEmails(this IServiceCollection services)
    {
        services.AddScoped<IEmailProvider, SmtpEmailProvider>();
        services.AddScoped<IEmailTemplateProvider, EmailTemplateProvider>();
        services.AddScoped<IEmailDispatcher, EmailDispatcher>();
        return services;
    }
}
