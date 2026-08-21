using Features.UserManagement.Repository;
using Microsoft.Extensions.DependencyInjection;

namespace Features.UserManagement.DependencyInjection;

/// <summary>
///     Registers the services used by the Features.UserManagement slice.
/// </summary>
public static class FeaturesUserManagementServiceCollectionExtensions
{
    /// <summary>
    ///     Registers <see cref="IUserAccountRepository" /> and its Dapper-based implementation.
    /// </summary>
    /// <returns>The same <paramref name="services" /> instance, for chaining.</returns>
    public static IServiceCollection AddFeaturesUserManagement(this IServiceCollection services)
    {
        services.AddScoped<IUserAccountRepository, UserAccountRepository>();
        return services;
    }
}
