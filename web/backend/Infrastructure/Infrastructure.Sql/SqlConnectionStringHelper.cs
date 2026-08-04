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
        string server =
            Environment.GetEnvironmentVariable("DB_SERVER")
            ?? throw new InvalidOperationException("DB_SERVER environment variable is not set");

        string dbName =
            databaseName
            ?? Environment.GetEnvironmentVariable("DB_NAME")
            ?? throw new InvalidOperationException("DB_NAME environment variable is not set");

        string user =
            Environment.GetEnvironmentVariable("DB_USER")
            ?? throw new InvalidOperationException("DB_USER environment variable is not set");

        string password =
            Environment.GetEnvironmentVariable("DB_PASSWORD")
            ?? throw new InvalidOperationException("DB_PASSWORD environment variable is not set");

        SqlConnectionStringBuilder builder = new()
        {
            DataSource = server,
            InitialCatalog = dbName,
            UserID = user,
            Password = password,
            TrustServerCertificate = true,
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
}
