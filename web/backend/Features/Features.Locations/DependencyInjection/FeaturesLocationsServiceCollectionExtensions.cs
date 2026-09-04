using Features.Locations.Repository;
using Microsoft.Extensions.DependencyInjection;

namespace Features.Locations.DependencyInjection;

public static class FeaturesLocationsServiceCollectionExtensions
{
    public static IServiceCollection AddFeaturesLocations(this IServiceCollection services)
    {
        services.AddScoped<ILocationRepository, LocationRepository>();
        return services;
    }
}
