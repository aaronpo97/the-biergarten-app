using API.Core;
using API.Core.Authentication;
using FluentValidation;
using FluentValidation.AspNetCore;
using Infrastructure.Email;
using Infrastructure.Email.Templates.Rendering;
using Infrastructure.Jwt;
using Infrastructure.PasswordHashing;
using Infrastructure.Repository.Auth;
using Infrastructure.Repository.Sql;
using Infrastructure.Repository.UserAccount;
using Infrastructure.Repository.Breweries;
using Service.Auth;
using Service.Breweries;
using Service.Emails;
using Service.UserManagement.User;
using Shared.Application.Behaviors;

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

// Add MediatR. Each Features.* slice's assembly is registered here as it's introduced;
// ValidationBehavior runs FluentValidation validators in the MediatR pipeline for command/query handlers.
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssemblyContaining<Program>();
    cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
});

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
builder.Services.AddScoped<IBreweryRepository, BreweryRepository>();
builder.Services.AddScoped<IBreweryService, BreweryService>();

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

// Configure JWT Authentication
builder
    .Services.AddAuthentication("JWT")
    .AddScheme<JwtAuthenticationOptions, JwtAuthenticationHandler>(
        "JWT",
        options => { }
    );

builder.Services.AddAuthorization();

var app = builder.Build();

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
var lifetime = app.Services.GetRequiredService<IHostApplicationLifetime>();
lifetime.ApplicationStopping.Register(() =>
{
    app.Logger.LogInformation("Application is shutting down gracefully...");
});

app.Run();
