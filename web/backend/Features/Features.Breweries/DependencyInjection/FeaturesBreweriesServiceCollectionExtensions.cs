using Features.Breweries.Repository;
using Microsoft.Extensions.DependencyInjection;

namespace Features.Breweries.DependencyInjection;

/// <summary>
/// Registers the services owned by the Breweries feature slice.
/// </summary>
public static class FeaturesBreweriesServiceCollectionExtensions
{
    public static IServiceCollection AddFeaturesBreweries(this IServiceCollection services)
    {
        services.AddScoped<IBreweryRepository, BreweryRepository>();
        return services;
    }
}
