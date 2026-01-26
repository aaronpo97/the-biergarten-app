using BusinessLayer.Services;
using DataAccessLayer.Repositories;
using DataAccessLayer.Sql;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddOpenApi();

// Dependency Injection
builder.Services.AddSingleton<ISqlConnectionFactory, DefaultSqlConnectionFactory>();
builder.Services.AddScoped<IUserAccountRepository, UserAccountRepository>();
builder.Services.AddScoped<IUserService, UserService>();
var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();
app.MapOpenApi();

app.UseHttpsRedirection();
app.MapControllers();
app.MapFallbackToController("Handle404", "NotFound");
app.Run();