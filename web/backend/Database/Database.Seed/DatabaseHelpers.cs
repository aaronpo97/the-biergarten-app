using Microsoft.Data.SqlClient;

namespace Database.Seed;

public class ConnectionStrings
{
    /// <summary>
    /// Builds a SQL Server connection string from the <c>DB_SERVER</c>, <c>DB_NAME</c>,
    /// <c>DB_USER</c>, <c>DB_PASSWORD</c>, and <c>DB_TRUST_SERVER_CERTIFICATE</c>
    /// environment variables.
    /// </summary>
    /// <returns>A fully built SQL Server connection string.</returns>
    /// <exception cref="InvalidOperationException">
    /// Thrown when <c>DB_SERVER</c>, <c>DB_NAME</c>, <c>DB_USER</c>, or <c>DB_PASSWORD</c>
    /// is not set.
    /// </exception>
    private static string GetSqlServerConnectionString()
    {
        string server =
            Environment.GetEnvironmentVariable("DB_SERVER")
            ?? throw new InvalidOperationException("DB_SERVER environment variable is not set");

        string dbName =
            Environment.GetEnvironmentVariable("DB_NAME")
            ?? throw new InvalidOperationException("DB_NAME environment variable is not set");

        string user =
            Environment.GetEnvironmentVariable("DB_USER")
            ?? throw new InvalidOperationException("DB_USER environment variable is not set");

        string password =
            Environment.GetEnvironmentVariable("DB_PASSWORD")
            ?? throw new InvalidOperationException("DB_PASSWORD environment variable is not set");

        string trustServerCertificate =
            Environment.GetEnvironmentVariable("DB_TRUST_SERVER_CERTIFICATE") ?? "True";

        SqlConnectionStringBuilder builder = new()
        {
            DataSource = server,
            InitialCatalog = dbName,
            UserID = user,
            Password = password,
            TrustServerCertificate = bool.Parse(trustServerCertificate),
            Encrypt = true,
        };

        return builder.ConnectionString;
    }


    public static string SqlServerConnectionString => GetSqlServerConnectionString();
    public static string SqliteConnectionString => "Data Source=seed.sqlite";
}
