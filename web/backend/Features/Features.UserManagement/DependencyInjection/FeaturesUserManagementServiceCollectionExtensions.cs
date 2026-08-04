using Features.UserManagement.Repository;
using Microsoft.Extensions.DependencyInjection;

namespace Features.UserManagement.DependencyInjection;

public static class FeaturesUserManagementServiceCollectionExtensions
{
    public static IServiceCollection AddFeaturesUserManagement(this IServiceCollection services)
    {
        services.AddScoped<IUserAccountRepository, UserAccountRepository>();
        return services;
    }
}
