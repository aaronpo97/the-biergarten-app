using API.Core;
using API.Core.Authentication;
using Database.Connection.DependencyInjection;
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
using Microsoft.OpenApi.Models;
using Shared.Application.Behaviors;

WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

// Add current controllers to the exception filter
builder
    .Services.AddControllers(options =>
    {
        options.Filters.Add<GlobalExceptionFilter>();
    })
    .AddApplicationPart(typeof(BreweryController).Assembly)
    .AddApplicationPart(typeof(UserController).Assembly)
    .AddApplicationPart(typeof(AuthController).Assembly);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Name = "Authorization",
            Type = SecuritySchemeType.Http,
            Scheme = "Bearer",
            BearerFormat = "JWT",
            In = ParameterLocation.Header,
            Description = "Enter a JWT access token.",
        }
    );
    options.AddSecurityRequirement(
        new OpenApiSecurityRequirement
        {
            {
                new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer",
                    },
                },
                []
            },
        }
    );
});
builder.Services.AddOpenApi();

builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddValidatorsFromAssembly(typeof(BreweryController).Assembly);
builder.Services.AddValidatorsFromAssembly(typeof(UserController).Assembly);
builder.Services.AddValidatorsFromAssembly(typeof(AuthController).Assembly);
builder.Services.AddFluentValidationAutoValidation();

// Add MediatR.
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

builder.Services.AddHealthChecks();

// Configure logging for container output
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
if (!builder.Environment.IsProduction())
    builder.Logging.AddDebug();

builder.Services.AddDatabaseConnection();

builder.Services.AddFeaturesBreweries();
builder.Services.AddFeaturesUserManagement();
builder.Services.AddFeaturesAuth();
builder.Services.AddFeaturesEmails();

// ITokenInfrastructure is registered here because JwtAuthenticationHandler depends on it directly.
builder.Services.AddScoped<ITokenInfrastructure, JwtInfrastructure>();

builder.Services.AddScoped<GlobalExceptionFilter>();

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

IHostApplicationLifetime lifetime = app.Services.GetRequiredService<IHostApplicationLifetime>();
lifetime.ApplicationStopping.Register(() =>
{
    app.Logger.LogInformation("Application is shutting down gracefully...");
});

app.Run();
