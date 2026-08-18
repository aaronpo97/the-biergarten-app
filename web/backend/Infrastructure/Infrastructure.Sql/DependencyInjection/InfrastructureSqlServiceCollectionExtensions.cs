using Microsoft.Extensions.DependencyInjection;

namespace Infrastructure.Sql.DependencyInjection;

public static class InfrastructureSqlServiceCollectionExtensions
{
    public static IServiceCollection AddInfrastructureSql(this IServiceCollection services)
    {
        services.AddSingleton<ISqlConnectionFactory, DefaultSqlConnectionFactory>();
        return services;
    }
}
