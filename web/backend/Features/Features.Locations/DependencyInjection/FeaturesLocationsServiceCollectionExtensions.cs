using Features.Locations.Repository;
using Microsoft.Extensions.DependencyInjection;

namespace Features.Locations.DependencyInjection;

/// <summary>
///     Registers the services used by the Features.Locations slice.
/// </summary>
public static class FeaturesLocationsServiceCollectionExtensions
{
    /// <summary>
    ///     Registers <see cref="ILocationRepository" /> and its Dapper-based implementation.
    /// </summary>
    /// <returns>The same <paramref name="services" /> instance, for chaining.</returns>
    public static IServiceCollection AddFeaturesLocations(this IServiceCollection services)
    {
        services.AddScoped<ILocationRepository, LocationRepository>();
        return services;
    }
}
