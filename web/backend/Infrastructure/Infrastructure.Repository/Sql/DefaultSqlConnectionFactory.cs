using System.Data.Common;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Repository.Sql;

public class DefaultSqlConnectionFactory(IConfiguration configuration)
    : ISqlConnectionFactory
{
    private readonly string _connectionString = GetConnectionString(
        configuration
    );

    private static string GetConnectionString(IConfiguration configuration)
    {
        // Check for full connection string first
        var fullConnectionString = Environment.GetEnvironmentVariable(
            "DB_CONNECTION_STRING"
        );
        if (!string.IsNullOrEmpty(fullConnectionString))
        {
            return fullConnectionString;
        }

        // Try to build from individual environment variables (preferred method for Docker)
        try
        {
            return SqlConnectionStringHelper.BuildConnectionString();
        }
        catch (InvalidOperationException)
        {
            // Fall back to configuration-based connection string if env vars are not set
            var connString = configuration.GetConnectionString("Default");
            if (!string.IsNullOrEmpty(connString))
            {
                return connString;
            }

            throw new InvalidOperationException(
                "Database connection string not configured. Set DB_CONNECTION_STRING or DB_SERVER, DB_NAME, DB_USER, DB_PASSWORD env vars or ConnectionStrings:Default."
            );
        }
    }

    public DbConnection CreateConnection()
    {
        return new SqlConnection(_connectionString);
    }
}
