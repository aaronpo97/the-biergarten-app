using System.Security.Claims;
using Shared.Contracts;
using JwtRegisteredClaimNames = System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames;

namespace API.Core;

internal class Program
{
    public static void Main(string[] args)
    {
        WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

        builder.Logging.ClearProviders().AddConsole();

        if (!builder.Environment.IsProduction())
            builder.Logging.AddDebug();

        builder
            .Services.AddApiControllers()
            .AddValidationAndMediatR()
            .AddApplicationServices()
            .AddFeatureModules()
            .AddCoreInfrastructure()
            .AddJwtAuthentication();

        WebApplication app = builder.Build();

        app.UseSwagger()
            .UseSwaggerUI()
            .UseHttpsRedirection()
            .UseAuthentication()
            .UseAuthorization();

        app.MapOpenApi();
        app.MapHealthChecks("/health");
        app.MapControllers();
        
        if (app.Environment.IsEnvironment("Testing"))
            app.MapGet(
                "/api/protected",
                (ClaimsPrincipal user) =>
                {
                    string? userId = user.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
                    string? username = user.FindFirst(JwtRegisteredClaimNames.UniqueName)?.Value;

                    return Results.Ok(
                        new ResponseBody<object>
                        {
                            Message = "Protected endpoint accessed successfully",
                            Payload = new { userId, username },
                        }
                    );
                }
            ).RequireAuthorization(policy => policy.AddAuthenticationSchemes("JWT").RequireAuthenticatedUser());

        // Easter egg, as per tradition with the previous versions of the Biergarten App.
        app.Map(
                "/teapot",
                () =>
                    Results.Json(
                        new ResponseBody
                        {
                            Message =
                                "I'm a little teapot, short and stout. Here is my handle, here is my spout!",
                        },
                        statusCode: 418
                    )
            )
            .ExcludeFromDescription();

        app.MapFallback(() =>
                Results.NotFound(
                    new ResponseBody { Message = "Are you lost? That route does not exist." }
                )
            )
            .ExcludeFromDescription();

        app.Services.GetRequiredService<IHostApplicationLifetime>()
            .ApplicationStopping.Register(() =>
            {
                app.Logger.LogInformation("Application is shutting down gracefully...");
            });

        app.Run();
    }
}
