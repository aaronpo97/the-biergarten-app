using System.Collections.Generic;
using API.Specs.Mocks;
using Infrastructure.Email;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Service.Emails;

namespace API.Specs
{
    public class TestApiFactory : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");

            builder.ConfigureServices(services =>
            {
                // Replace the real email provider with mock for testing
                var emailProviderDescriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(IEmailProvider));

                if (emailProviderDescriptor != null)
                {
                    services.Remove(emailProviderDescriptor);
                }

                services.AddScoped<IEmailProvider, MockEmailProvider>();

                // Replace the real email service with mock for testing
                var emailServiceDescriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(IEmailService));

                if (emailServiceDescriptor != null)
                {
                    services.Remove(emailServiceDescriptor);
                }

                services.AddScoped<IEmailService, MockEmailService>();
            });
        }
    }
}
