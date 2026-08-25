using Infrastructure.Configuration;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;

namespace Database.Connection;

/// <summary>
///     Helper for building SQL Server connection strings from configuration
///     (backed by the <c>DB_*</c> environment variables).
/// </summary>
public static class SqlConnectionStringHelper
{
    private static SqlConnectionStringBuilder MakeConfiguredConnectionBuilder(
        IConfiguration configuration
    ) =>
        new()
        {
            DataSource = ConfigurationHelpers.GetKeyOrThrow(
                configuration,
                ConfigurationKeys.DbServer
            ),
            UserID = ConfigurationHelpers.GetKeyOrThrow(configuration, ConfigurationKeys.DbUser),
            Password = ConfigurationHelpers.GetKeyOrThrow(
                configuration,
                ConfigurationKeys.DbPassword
            ),
            TrustServerCertificate = ResolveTrustServerCertificate(configuration),
            Encrypt = true,
        };

    /// <summary>
    ///     Builds a SQL Server connection string from configuration.
    /// </summary>
    /// <remarks>
    ///     Returns <c>false</c> if DB_SERVER, DB_NAME, DB_USER, or DB_PASSWORD is unset.
    /// </remarks>
    /// <param name="configuration">The configuration to read the <c>DB_*</c> values from.</param>
    /// <param name="connectionString">The resolved connection string, if successful.</param>
    public static bool TryGetStandardDbConnectionString(
        IConfiguration configuration,
        out string connectionString
    )
    {
        connectionString = string.Empty;
        try
        {
            SqlConnectionStringBuilder builder = MakeConfiguredConnectionBuilder(configuration);
            builder.InitialCatalog = ConfigurationHelpers.GetKeyOrThrow(
                configuration,
                ConfigurationKeys.DbName
            );
            connectionString = builder.ConnectionString;
            return true;
        }
        catch
        {
            return false;
        }
    }

    public static bool TryGetMasterConnectionString(
        IConfiguration configuration,
        out string connectionString
    )
    {
        connectionString = string.Empty;
        try
        {
            var builder = MakeConfiguredConnectionBuilder(configuration);
            builder.InitialCatalog = "master";

            connectionString = builder.ConnectionString;

            return true;
        }
        catch
        {
            return false;
        }
    }

    public static bool TryGetDatabaseNameFromConnectionString(
        string connectionString,
        out string databaseName
    )
    {
        databaseName = string.Empty;

        try
        {
            var builder = new SqlConnectionStringBuilder(connectionString);
            databaseName = builder.InitialCatalog;
            return true;
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    ///     Resolves the <c>DB_TRUST_SERVER_CERTIFICATE</c> configuration value, defaulting to
    ///     <c>true</c> when it is unset or not a valid boolean.
    /// </summary>
    private static bool ResolveTrustServerCertificate(IConfiguration configuration)
    {
        return !bool.TryParse(
                configuration[ConfigurationKeys.DbTrustServerCertificate],
                out bool trustServerCertificate
            ) || trustServerCertificate;
    }
}
