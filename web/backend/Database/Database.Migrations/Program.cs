using Database.Connection;
using Infrastructure.Configuration;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace Database.Migrations;

/// <summary>
/// Application entry point. Responsible only for wiring up configuration
/// and delegating the migration run to <see cref="DbMigrator"/>.
/// </summary>
internal static class Program
{
    private static async Task Main(string[] args)
    {
        Console.WriteLine("Starting database migrations...");

        try
        {
            IConfiguration configuration = new ConfigurationBuilder()
                .AddEnvironmentVariables()
                .Build();

            bool clearDatabase = string.Equals(
                configuration[ConfigurationKeys.ClearDatabase],
                "true",
                StringComparison.OrdinalIgnoreCase
            );

            DbMigrator migrator = new(
                new DefaultSqlConnectionFactory(configuration),
                new MasterSqlConnectionFactory(configuration),
                clearDatabase
            );
            await migrator.RunAsync();
        }
        catch (Exception ex) when (ex is InvalidOperationException or SqlException)
        {
            Console.Error.WriteLine("An error occurred during database migrations:");
            Console.Error.WriteLine(ex.Message);
        }
    }
}
