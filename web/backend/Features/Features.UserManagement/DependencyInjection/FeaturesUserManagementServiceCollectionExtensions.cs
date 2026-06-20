using Features.UserManagement.Repository;
using Microsoft.Extensions.DependencyInjection;

namespace Features.UserManagement.DependencyInjection;

/// <summary>
///     Registers the services owned by the UserManagement feature slice.
/// </summary>
public static class FeaturesUserManagementServiceCollectionExtensions
{
    public static IServiceCollection AddFeaturesUserManagement(this IServiceCollection services)
    {
        services.AddScoped<IUserAccountRepository, UserAccountRepository>();
        return services;
    }
}