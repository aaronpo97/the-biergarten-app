using Microsoft.Data.SqlClient;

namespace Infrastructure.Sql;

/// <summary>
///     Helper for building SQL Server connection strings from environment variables.
/// </summary>
public static class SqlConnectionStringHelper
{
    /// <summary>
    ///     Builds a SQL Server connection string from environment variables.
    /// </summary>
    /// <remarks>Throws <see cref="InvalidOperationException" /> if DB_SERVER, DB_NAME, DB_USER, or DB_PASSWORD is unset.</remarks>
    /// <param name="databaseName">If null, falls back to the DB_NAME environment variable.</param>
    public static string BuildConnectionString(string? databaseName = null)
    {
        string server = Required("DB_SERVER");
        string dbName = databaseName ?? Required("DB_NAME");
        string user = Required("DB_USER");
        string password = Required("DB_PASSWORD");

        SqlConnectionStringBuilder builder = new()
        {
            DataSource = server,
            InitialCatalog = dbName,
            UserID = user,
            Password = password,
            TrustServerCertificate = ResolveTrustServerCertificate(),
            Encrypt = true,
        };

        return builder.ConnectionString;
    }

    /// <summary>
    ///     Builds a connection string to the master database using environment variables.
    /// </summary>
    public static string BuildMasterConnectionString()
    {
        return BuildConnectionString("master");
    }

    /// <summary>
    ///     Resolves the <c>DB_TRUST_SERVER_CERTIFICATE</c> environment variable, defaulting to
    ///     <c>true</c> when it is unset or not a valid boolean.
    /// </summary>
    private static bool ResolveTrustServerCertificate()
    {
        return !bool.TryParse(
                Environment.GetEnvironmentVariable("DB_TRUST_SERVER_CERTIFICATE"),
                out bool trustServerCertificate
            )
            || trustServerCertificate;
    }

    private static string Required(string variableName) =>
        Environment.GetEnvironmentVariable(variableName)
        ?? throw new InvalidOperationException(
            $"The {variableName} environment variable is not set."
        );
}
