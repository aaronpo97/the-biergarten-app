using API.Core;
using API.Specs.Mocks;
using Features.Emails.Services;
using Features.ImageUploads.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace API.Specs;

internal class TestApiFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            ServiceDescriptor? emailProviderDescriptor = services.SingleOrDefault(d =>
                d.ServiceType == typeof(IEmailProvider)
            );

            if (emailProviderDescriptor != null)
                services.Remove(emailProviderDescriptor);

            services.AddScoped<IEmailProvider, MockEmailProvider>();

            ServiceDescriptor? emailDispatcherDescriptor = services.SingleOrDefault(d =>
                d.ServiceType == typeof(IEmailDispatcher)
            );

            if (emailDispatcherDescriptor != null)
                services.Remove(emailDispatcherDescriptor);

            services.AddScoped<IEmailDispatcher, MockEmailDispatcher>();

            ServiceDescriptor? fileStorageDescriptor = services.SingleOrDefault(d =>
                d.ServiceType == typeof(IFileStorageProvider)
            );

            if (fileStorageDescriptor != null)
                services.Remove(fileStorageDescriptor);

            services.AddSingleton<IFileStorageProvider, MockFileStorageProvider>();
        });
    }
}
