using Features.Auth.Identity;
using Features.Auth.Repository;
using Features.Auth.Services;
using Infrastructure.PasswordHashing;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;

namespace Features.Auth.DependencyInjection;

/// <summary>Registers the services required by Features.Users with the dependency injection container.</summary>
public static class FeaturesAuthServiceCollectionExtensions
{
    /// <summary>
    ///     Adds <see cref="ITokenService" />, <see cref="IUserListRepository" />,
    ///     <see cref="IUserProfileRepository" />, and ASP.NET Core Identity
    ///     (<see cref="UserManager{TUser}" /> backed by <see cref="DapperUserStore" /> and
    ///     <see cref="Argon2PasswordHasher" />) as scoped services.
    /// </summary>
    public static IServiceCollection AddFeaturesAuth(this IServiceCollection services)
    {
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IPasswordInfrastructure, Argon2Infrastructure>();
        services.AddScoped<IUserListRepository, UserListRepository>();
        services.AddScoped<IUserProfileRepository, UserProfileRepository>();

        // AddDefaultTokenProviders() is deliberately not called: it registers
        // DataProtectorTokenProvider<TUser>, which UserManager's constructor resolves eagerly and which
        // requires IDataProtectionProvider -- not registered in the plain-console-app DI containers this
        // solution builds (e.g. Database.Seed). Identity's own token providers are unused here anyway;
        // account confirmation keeps using its own JWT-based tokens (see ITokenService).
        services.AddIdentityCore<ApplicationUser>(options =>
        {
            options.User.RequireUniqueEmail = true;

            // Password/username complexity is already enforced by RegisterUserValidator
            // (FluentValidation); disable Identity's own checks to avoid duplicated/drifting rules.
            options.Password.RequireDigit = false;
            options.Password.RequireLowercase = false;
            options.Password.RequireUppercase = false;
            options.Password.RequireNonAlphanumeric = false;
            options.Password.RequiredLength = 1;
        });

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
