using Microsoft.Data.SqlClient;

namespace DBSeed
{
    internal interface ISeeder
    {
        Task SeedAsync(SqlConnection connection);
    }
}