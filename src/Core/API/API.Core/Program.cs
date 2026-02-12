using FluentValidation;
using FluentValidation.AspNetCore;
using Infrastructure.Jwt;
using Infrastructure.PasswordHashing;
using Infrastructure.Repository.Auth;
using Infrastructure.Repository.Sql;
using Infrastructure.Repository.UserAccount;
using Microsoft.AspNetCore.Mvc;
using Service.Core.Auth;
using Service.Core.User;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            var message = errors.Count == 1
                ? errors[0]
                : string.Join(" ", errors);

            var response = new
            {
                message
            };

            return new BadRequestObjectResult(response);
        };
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddOpenApi();

// Add FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<Program>();
builder.Services.AddFluentValidationAutoValidation();

// Add health checks
builder.Services.AddHealthChecks();

// Configure logging for container output
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
if (!builder.Environment.IsProduction())
{
    builder.Logging.AddDebug();
}

// Dependency Injection
builder.Services.AddSingleton<ISqlConnectionFactory, DefaultSqlConnectionFactory>();
builder.Services.AddScoped<IUserAccountRepository, UserAccountRepository>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IPasswordInfra, Argon2Infrastructure>();

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.MapOpenApi();

app.UseHttpsRedirection();

// Health check endpoint (used by Docker health checks and orchestrators)
app.MapHealthChecks("/health");

app.MapControllers();
app.MapFallbackToController("Handle404", "NotFound");

// Graceful shutdown handling
var lifetime = app.Services.GetRequiredService<IHostApplicationLifetime>();
lifetime.ApplicationStopping.Register(() =>
{
    app.Logger.LogInformation("Application is shutting down gracefully...");
});

app.Run();

// Make Program class accessible to test projects
public partial class Program { }
