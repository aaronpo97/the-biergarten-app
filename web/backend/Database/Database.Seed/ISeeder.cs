using Microsoft.Data.SqlClient;

namespace Database.Seed;

/// <summary>
///     Defines a unit of seed data that can be applied to the database. Implementations
///     should be safe to run against an already-seeded database (e.g. by checking for
///     existing data before inserting) and may depend on data created by seeders that run
///     before them.
/// </summary>
internal interface ISeeder
{
    /// <summary>
    ///     Inserts this seeder's data into the database using the supplied open connection.
    /// </summary>
    /// <param name="connection">An open connection to the target database.</param>
    /// <returns>A task that completes when seeding is finished.</returns>
    Task SeedAsync(SqlConnection connection);
}