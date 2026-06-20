using API.Specs.Mocks;
using Features.Emails.Services;
using Infrastructure.Email;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace API.Specs;

public class TestApiFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            // Replace the real email provider with mock for testing
            ServiceDescriptor? emailProviderDescriptor = services.SingleOrDefault(d =>
                d.ServiceType == typeof(IEmailProvider)
            );

            if (emailProviderDescriptor != null)
                services.Remove(emailProviderDescriptor);

            services.AddScoped<IEmailProvider, MockEmailProvider>();

            // Replace the real email dispatcher with mock for testing
            ServiceDescriptor? emailDispatcherDescriptor = services.SingleOrDefault(d =>
                d.ServiceType == typeof(IEmailDispatcher)
            );

            if (emailDispatcherDescriptor != null)
                services.Remove(emailDispatcherDescriptor);

            services.AddScoped<IEmailDispatcher, MockEmailDispatcher>();
        });
    }
}
