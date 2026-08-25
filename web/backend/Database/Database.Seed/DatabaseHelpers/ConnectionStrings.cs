#region

using Database.Connection;
using Microsoft.Extensions.Configuration;

#endregion

namespace Database.Seed.DatabaseHelpers;

public static class ConnectionStrings
{
    public static string GetSqlServerConnectionString(IConfiguration configuration) =>
        SqlConnectionStringHelper.TryGetStandardDbConnectionString(
            configuration,
            out string connectionString
        )
            ? connectionString
            : throw new InvalidOperationException(
                "Database connection string not configured. Set DB_SERVER, DB_NAME, DB_USER, DB_PASSWORD env vars."
            );

    public static string SqliteConnectionString =>
        "Data Source=SeedData/biergarten_seed_2026-08-24T01-52-09.841693Z.sqlite";
}
