#region

using Infrastructure.Sql;
using Microsoft.Extensions.Configuration;

#endregion

namespace Database.Seed.DatabaseHelpers;

public class ConnectionStrings
{
    public static string GetSqlServerConnectionString(IConfiguration configuration) =>
        SqlConnectionStringHelper.BuildConnectionString(configuration);

    public static string SqliteConnectionString =>
        "Data Source=SeedData/biergarten_seed_2026-08-24T01-52-09.841693Z.sqlite";
}
