using Features.Auth.Identity;
using Features.Auth.Repository;
using Features.Auth.Services;
using Infrastructure.PasswordHashing;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace Features.Auth.DependencyInjection;

/// <summary>Registers the services required by Features.Auth with the dependency injection container.</summary>
public static class FeaturesAuthServiceCollectionExtensions
{
    /// <summary>
    ///     Adds <see cref="IAuthRepository" />, <see cref="ITokenService" />, the Argon2 password hashing
    ///     infrastructure, and ASP.NET Core Identity (<see cref="UserManager{TUser}" /> backed by
    ///     <see cref="DapperUserStore" />) as scoped services.
    /// </summary>
    public static IServiceCollection AddFeaturesAuth(this IServiceCollection services)
    {
        services.AddScoped<IAuthRepository, AuthRepository>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IPasswordInfrastructure, Argon2Infrastructure>();

        services
            .AddIdentityCore<ApplicationUser>(options =>
            {
                options.User.RequireUniqueEmail = true;

                // Password/username complexity is already enforced by RegisterUserValidator
                // (FluentValidation); disable Identity's own checks to avoid duplicated/drifting rules.
                options.Password.RequireDigit = false;
                options.Password.RequireLowercase = false;
                options.Password.RequireUppercase = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequiredLength = 1;
            })
            .AddDefaultTokenProviders();

        services.AddScoped<DapperUserStore>();
        services.AddScoped<IUserStore<ApplicationUser>>(sp =>
            sp.GetRequiredService<DapperUserStore>()
        );
        services.AddScoped<IUserEmailStore<ApplicationUser>>(sp =>
            sp.GetRequiredService<DapperUserStore>()
        );
        services.AddScoped<IUserPasswordStore<ApplicationUser>>(sp =>
            sp.GetRequiredService<DapperUserStore>()
        );
        services.AddScoped<IPasswordHasher<ApplicationUser>, Argon2PasswordHasher>();

        return services;
    }
}
