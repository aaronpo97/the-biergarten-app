using API.Core;
using API.Core.Authentication;
using Features.Auth.Controllers;
using Features.Auth.DependencyInjection;
using Features.Breweries.Controllers;
using Features.Breweries.DependencyInjection;
using Features.Emails.DependencyInjection;
using Features.Emails.Services;
using Features.UserManagement.Controllers;
using Features.UserManagement.DependencyInjection;
using FluentValidation;
using FluentValidation.AspNetCore;
using Infrastructure.Jwt;
using Infrastructure.Sql;
using Shared.Application.Behaviors;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

// Global Exception Filter
builder
    .Services.AddControllers(options =>
    {
        options.Filters.Add<GlobalExceptionFilter>();
    })
    .AddApplicationPart(typeof(BreweryController).Assembly)
    .AddApplicationPart(typeof(UserController).Assembly)
    .AddApplicationPart(typeof(AuthController).Assembly);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddOpenApi();

// Add FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddValidatorsFromAssembly(typeof(BreweryController).Assembly);
builder.Services.AddValidatorsFromAssembly(typeof(UserController).Assembly);
builder.Services.AddValidatorsFromAssembly(typeof(AuthController).Assembly);
builder.Services.AddFluentValidationAutoValidation();

// Add MediatR. Each Features.* slice's assembly is registered here as it's introduced;
// ValidationBehavior runs FluentValidation validators in the MediatR pipeline for command/query handlers.
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssemblyContaining<Program>();
    cfg.RegisterServicesFromAssembly(typeof(BreweryController).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(UserController).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(AuthController).Assembly);
    cfg.RegisterServicesFromAssembly(typeof(IEmailDispatcher).Assembly);
    cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
});

// Add health checks
builder.Services.AddHealthChecks();

// Configure logging for container output
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
if (!builder.Environment.IsProduction())
    builder.Logging.AddDebug();

// Configure Dependency Injection -------------------------------------------------------------------------------------

builder.Services.AddSingleton<ISqlConnectionFactory, DefaultSqlConnectionFactory>();

builder.Services.AddFeaturesBreweries();
builder.Services.AddFeaturesUserManagement();
builder.Services.AddFeaturesAuth();
builder.Services.AddFeaturesEmails();

// ITokenInfrastructure is registered here (not inside Features.Auth's own DI extension) because
// JwtAuthenticationHandler, a host-level auth middleware concern, also depends on it directly.
builder.Services.AddScoped<ITokenInfrastructure, JwtInfrastructure>();

// Register the exception filter
builder.Services.AddScoped<GlobalExceptionFilter>();

// Configure JWT Authentication
builder
    .Services.AddAuthentication("JWT")
    .AddScheme<JwtAuthenticationOptions, JwtAuthenticationHandler>("JWT", options => { });

builder.Services.AddAuthorization();

WebApplication app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.MapOpenApi();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

// Health check endpoint (used by Docker health checks and orchestrators)
app.MapHealthChecks("/health");

app.MapControllers();
app.MapFallbackToController("Handle404", "NotFound");

// Graceful shutdown handling
IHostApplicationLifetime lifetime = app.Services.GetRequiredService<IHostApplicationLifetime>();
lifetime.ApplicationStopping.Register(() =>
{
    app.Logger.LogInformation("Application is shutting down gracefully...");
});

app.Run();
