using Features.Breweries.Repository;
using Microsoft.Extensions.DependencyInjection;

namespace Features.Breweries.DependencyInjection;

/// <summary>Registers the services required by the Breweries feature.</summary>
public static class FeaturesBreweriesServiceCollectionExtensions
{
    /// <summary>Registers <see cref="IBreweryRepository" /> and its implementation.</summary>
    /// <returns><paramref name="services" />, for chaining.</returns>
    public static IServiceCollection AddFeaturesBreweries(this IServiceCollection services)
    {
        services.AddScoped<IBreweryRepository, BreweryRepository>();
        return services;
    }
}
