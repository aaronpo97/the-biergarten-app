using Microsoft.Extensions.DependencyInjection;

namespace Database.Connection.DependencyInjection;

/// <summary>Extension methods for registering database connection services with dependency injection.</summary>
public static class DatabaseConnectionServiceCollectionExtensions
{
    /// <summary>Registers <see cref="DefaultSqlConnectionFactory" /> as a singleton <see cref="ISqlConnectionFactory" />.</summary>
    /// <returns>The same <paramref name="services" /> instance, for chaining.</returns>
    public static IServiceCollection AddDatabaseConnection(this IServiceCollection services)
    {
        services.AddSingleton<ISqlConnectionFactory, DefaultSqlConnectionFactory>();
        return services;
    }
}
