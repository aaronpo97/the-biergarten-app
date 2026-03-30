using Microsoft.Extensions.DependencyInjection;

namespace Service.Breweries.DependencyInjection;

public static class BreweryServiceCollectionExtensions
{
   public static IServiceCollection AddBreweryServices(this IServiceCollection services)
   {
      services.AddScoped<IBreweryService, BreweryService>();
      return services;
   }
}
