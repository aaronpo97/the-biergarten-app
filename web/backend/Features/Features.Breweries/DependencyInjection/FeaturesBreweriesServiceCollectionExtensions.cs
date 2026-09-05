using Features.Breweries.Repository;
using Microsoft.Extensions.DependencyInjection;

namespace Features.Breweries.DependencyInjection;

/// <summary>
///     Adds Breweries feature services to the dependency-injection container.
/// </summary>
public static class FeaturesBreweriesServiceCollectionExtensions
{
    /// <summary>
    ///     Registers the repository services used by the Breweries feature.
    /// </summary>
    /// <returns>The supplied service collection.</returns>
    public static IServiceCollection AddFeaturesBreweries(this IServiceCollection services)
    {
        services.AddScoped<IBreweryRepository, BreweryRepository>();
        return services;
    }
}
