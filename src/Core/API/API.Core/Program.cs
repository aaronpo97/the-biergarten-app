using DataAccessLayer.Repositories.UserAccount;
using DataAccessLayer.Repositories.UserCredential;
using DataAccessLayer.Sql;
using ServiceCore.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddOpenApi();

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
builder.Services.AddScoped<IUserCredentialRepository, UserCredentialRepository>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IJwtService, JwtService>();

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