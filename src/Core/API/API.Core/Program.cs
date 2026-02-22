using API.Core;
using API.Core.Contracts.Common;
using Domain.Exceptions;
using FluentValidation;
using FluentValidation.AspNetCore;
using Infrastructure.Email;
using Infrastructure.Email.Templates;
using Infrastructure.Email.Templates.Rendering;
using Infrastructure.Jwt;
using Infrastructure.PasswordHashing;
using Infrastructure.Repository.Auth;
using Infrastructure.Repository.Sql;
using Infrastructure.Repository.UserAccount;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Service.Auth;
using Service.UserManagement.User;
using Service.Emails;

var builder = WebApplication.CreateBuilder(args);

// Global Exception Filter
builder.Services.AddControllers(options =>
{
    options.Filters.Add<GlobalExceptionFilter>();
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

// Configure Dependency Injection -------------------------------------------------------------------------------------

builder.Services.AddSingleton<
    ISqlConnectionFactory,
    DefaultSqlConnectionFactory
>();

builder.Services.AddScoped<IUserAccountRepository, UserAccountRepository>();
builder.Services.AddScoped<IAuthRepository, AuthRepository>();

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<ILoginService, LoginService>();
builder.Services.AddScoped<IRegisterService, RegisterService>();
builder.Services.AddScoped<ITokenService, TokenService>();

builder.Services.AddScoped<ITokenInfrastructure, JwtInfrastructure>();
builder.Services.AddScoped<IPasswordInfrastructure, Argon2Infrastructure>();
builder.Services.AddScoped<IEmailProvider, SmtpEmailProvider>();
builder.Services.AddScoped<IEmailTemplateProvider, EmailTemplateProvider>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IConfirmationService, ConfirmationService>();

// Register the exception filter
builder.Services.AddScoped<GlobalExceptionFilter>();

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
