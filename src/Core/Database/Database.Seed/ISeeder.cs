using Microsoft.Data.SqlClient;

namespace Database.Seed;

internal interface ISeeder
{
    Task SeedAsync(SqlConnection connection);
}