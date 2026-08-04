using Features.Auth.Repository;
using Features.Auth.Services;
using Infrastructure.PasswordHashing;
using Microsoft.Extensions.DependencyInjection;

namespace Features.Auth.DependencyInjection;

public static class FeaturesAuthServiceCollectionExtensions
{
    public static IServiceCollection AddFeaturesAuth(this IServiceCollection services)
    {
        services.AddScoped<IAuthRepository, AuthRepository>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IPasswordInfrastructure, Argon2Infrastructure>();
        return services;
    }
}
