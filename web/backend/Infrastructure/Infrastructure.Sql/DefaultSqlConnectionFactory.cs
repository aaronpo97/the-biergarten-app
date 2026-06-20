using System.Data.Common;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Sql;

/// <summary>
///     Default <see cref="ISqlConnectionFactory" /> implementation that creates SQL Server connections,
///     resolving the connection string from environment variables or application configuration.
/// </summary>
/// <param name="configuration">The application configuration, used as a fallback source for the connection string.</param>
public class DefaultSqlConnectionFactory(IConfiguration configuration) : ISqlConnectionFactory
{
    private readonly string _connectionString = GetConnectionString(configuration);

    /// <summary>
    ///     Creates a new, unopened <see cref="SqlConnection" /> using the resolved connection string.
    /// </summary>
    /// <returns>A new <see cref="SqlConnection" /> instance.</returns>
    public DbConnection CreateConnection()
    {
        return new SqlConnection(_connectionString);
    }

    /// <summary>
    ///     Resolves the SQL Server connection string, preferring (in order): the <c>DB_CONNECTION_STRING</c>
    ///     environment variable, a connection string built from individual <c>DB_*</c> environment variables
    ///     via <see cref="SqlConnectionStringHelper.BuildConnectionString" />, and finally the <c>"Default"</c>
    ///     connection string from <paramref name="configuration" />.
    /// </summary>
    /// <param name="configuration">The application configuration to fall back to.</param>
    /// <returns>The resolved SQL Server connection string.</returns>
    /// <exception cref="InvalidOperationException">
    ///     Thrown when no connection string can be resolved from any of the supported sources.
    /// </exception>
    private static string GetConnectionString(IConfiguration configuration)
    {
        // Check for full connection string first
        string? fullConnectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
        if (!string.IsNullOrEmpty(fullConnectionString))
            return fullConnectionString;

        // Try to build from individual environment variables (preferred method for Docker)
        try
        {
            return SqlConnectionStringHelper.BuildConnectionString();
        }
        catch (InvalidOperationException)
        {
            // Fall back to configuration-based connection string if env vars are not set
            string? connString = configuration.GetConnectionString("Default");
            if (!string.IsNullOrEmpty(connString))
                return connString;

            throw new InvalidOperationException(
                "Database connection string not configured. Set DB_CONNECTION_STRING or DB_SERVER, DB_NAME, DB_USER, DB_PASSWORD env vars or ConnectionStrings:Default."
            );
        }
    }
}
