using Infrastructure.Configuration;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace Database.Connection;

/// <summary>
///     Default <see cref="DefaultSqlConnectionFactory" /> implementation that creates SQL Server connections,
///     resolving the connection string from environment variables or application configuration.
/// </summary>
public class DefaultSqlConnectionFactory(IConfiguration configuration) : ISqlConnectionFactory
{
    /// <summary>
    ///     The resolved SQL Server connection string, preferring (in order): the <c>DB_CONNECTION_STRING</c>
    ///     configuration value, and a connection string built from individual <c>DB_*</c> configuration values.
    /// </summary>
    /// <exception cref="InvalidOperationException">Thrown when no connection string can be resolved from any source.</exception>
    public string ConnectionString
    {
        get
        {
            string? fullConnectionString = configuration[ConfigurationKeys.DbConnectionString];
            if (!string.IsNullOrEmpty(fullConnectionString))
                return fullConnectionString;

            // Try to build from individual configuration values (preferred method for Docker)
            if (
                SqlConnectionStringHelper.TryGetStandardDbConnectionString(
                    configuration,
                    out var connectionString
                )
            )
                return connectionString;

            throw new InvalidOperationException(
                "Database connection string not configured. Set DB_CONNECTION_STRING or DB_SERVER, DB_NAME, DB_USER, DB_PASSWORD env vars."
            );
        }
    }

    /// <inheritdoc />
    public SqlConnection CreateConnection()
    {
        return new SqlConnection(ConnectionString);
    }
}
