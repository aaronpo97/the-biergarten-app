#region

using Infrastructure.Sql;

#endregion

namespace Database.Seed.DatabaseHelpers;

public class ConnectionStrings
{
    public static string SqlServerConnectionString => SqlConnectionStringHelper.BuildConnectionString();
    public static string SqliteConnectionString =>
        "Data Source=SeedData/biergarten_seed_2026-07-20T05-46-02.993511Z.sqlite";
}
