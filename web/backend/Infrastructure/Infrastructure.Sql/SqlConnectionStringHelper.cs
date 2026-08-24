using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.Sql;

/// <summary>
///     Helper for building SQL Server connection strings from configuration
///     (backed by the <c>DB_*</c> environment variables).
/// </summary>
public static class SqlConnectionStringHelper
{
    /// <summary>
    ///     Builds a SQL Server connection string from configuration.
    /// </summary>
    /// <remarks>Throws <see cref="InvalidOperationException" /> if DB_SERVER, DB_NAME, DB_USER, or DB_PASSWORD is unset.</remarks>
    /// <param name="configuration">The configuration to read the <c>DB_*</c> values from.</param>
    /// <param name="databaseName">If null, falls back to the DB_NAME configuration value.</param>
    public static string BuildConnectionString(
        IConfiguration configuration,
        string? databaseName = null
    )
    {
        string server = Required(configuration, "DB_SERVER");
        string dbName = databaseName ?? Required(configuration, "DB_NAME");
        string user = Required(configuration, "DB_USER");
        string password = Required(configuration, "DB_PASSWORD");

        SqlConnectionStringBuilder builder = new()
        {
            DataSource = server,
            InitialCatalog = dbName,
            UserID = user,
            Password = password,
            TrustServerCertificate = ResolveTrustServerCertificate(configuration),
            Encrypt = true,
        };

        return builder.ConnectionString;
    }

    public static string BuildMasterConnectionString(IConfiguration configuration)
    {
        return BuildConnectionString(configuration, "master");
    }

    /// <summary>
    ///     Resolves the <c>DB_TRUST_SERVER_CERTIFICATE</c> configuration value, defaulting to
    ///     <c>true</c> when it is unset or not a valid boolean.
    /// </summary>
    private static bool ResolveTrustServerCertificate(IConfiguration configuration)
    {
        return !bool.TryParse(
                configuration["DB_TRUST_SERVER_CERTIFICATE"],
                out bool trustServerCertificate
            )
            || trustServerCertificate;
    }

    private static string Required(IConfiguration configuration, string key) =>
        configuration[key]
        ?? throw new InvalidOperationException($"The {key} environment variable is not set.");
}
