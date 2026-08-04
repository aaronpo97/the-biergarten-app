using Features.Emails.Services;
using Infrastructure.Email;
using Infrastructure.Email.Templates.Rendering;
using Microsoft.Extensions.DependencyInjection;

namespace Features.Emails.DependencyInjection;

public static class FeaturesEmailsServiceCollectionExtensions
{
    public static IServiceCollection AddFeaturesEmails(this IServiceCollection services)
    {
        services.AddScoped<IEmailProvider, SmtpEmailProvider>();
        services.AddScoped<IEmailTemplateProvider, EmailTemplateProvider>();
        services.AddScoped<IEmailDispatcher, EmailDispatcher>();
        return services;
    }
}
