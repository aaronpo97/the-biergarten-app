using Microsoft.Data.SqlClient;

namespace Database.Seed.DatabaseHelpers;

public class ConnectionStrings
{
    public static string SqlServerConnectionString => GetSqlServerConnectionString();
    public static string SqliteConnectionString => "Data Source=SeedData/seed.sqlite";

    private static string GetSqlServerConnectionString()
    {
        var server =
            Environment.GetEnvironmentVariable("DB_SERVER")
            ?? throw new InvalidOperationException("DB_SERVER environment variable is not set");

        var dbName =
            Environment.GetEnvironmentVariable("DB_NAME")
            ?? throw new InvalidOperationException("DB_NAME environment variable is not set");

        var user =
            Environment.GetEnvironmentVariable("DB_USER")
            ?? throw new InvalidOperationException("DB_USER environment variable is not set");

        var password =
            Environment.GetEnvironmentVariable("DB_PASSWORD")
            ?? throw new InvalidOperationException("DB_PASSWORD environment variable is not set");

        var trustServerCertificate =
            Environment.GetEnvironmentVariable("DB_TRUST_SERVER_CERTIFICATE") ?? "True";

        SqlConnectionStringBuilder builder = new()
        {
            DataSource = server,
            InitialCatalog = dbName,
            UserID = user,
            Password = password,
            TrustServerCertificate = bool.Parse(trustServerCertificate),
            Encrypt = true
        };

        return builder.ConnectionString;
    }
}