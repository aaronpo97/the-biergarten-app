using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure.Sql.DependencyInjection;

/// <summary>Extension methods for registering SQL infrastructure services with dependency injection.</summary>
public static class InfrastructureSqlServiceCollectionExtensions
{
    /// <summary>Registers <see cref="DefaultSqlConnectionFactory" /> as a singleton <see cref="ISqlConnectionFactory" />.</summary>
    /// <returns>The same <paramref name="services" /> instance, for chaining.</returns>
    public static IServiceCollection AddInfrastructureSql(this IServiceCollection services)
    {
        services.AddSingleton<ISqlConnectionFactory, DefaultSqlConnectionFactory>();
        return services;
    }
}
