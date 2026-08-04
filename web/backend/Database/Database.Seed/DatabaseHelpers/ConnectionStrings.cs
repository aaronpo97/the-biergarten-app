#region

using Microsoft.Data.SqlClient;

#endregion

namespace Database.Seed.DatabaseHelpers;

public class ConnectionStrings
{
    public static string SqlServerConnectionString => GetSqlServerConnectionString();
    public static string SqliteConnectionString =>
        "Data Source=SeedData/biergarten_seed_2026-07-20T05-46-02.993511Z.sqlite";

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
}
