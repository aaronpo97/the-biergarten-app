using System.Collections.Generic;
using API.Specs.Mocks;
using Infrastructure.Email;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace API.Specs
{
    public class TestApiFactory : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");

            builder.ConfigureServices(services =>
            {
                // Replace the real email service with mock for testing
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(IEmailService));

                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }

                services.AddScoped<IEmailService, MockEmailService>();
            });
        }
    }
}
