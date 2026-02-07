using DBSeed;
using Microsoft.Data.SqlClient;
using DbUp;
using System.Reflection;

try
{
    var connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");

    Console.WriteLine("Connected to database.");
    Console.WriteLine("Starting seeding...");

    using (var connection = new SqlConnection(connectionString))
    {
        await connection.OpenAsync();

        ISeeder[] seeders =
        [
            new LocationSeeder(),
            new UserSeeder(),
        ];

        foreach (var seeder in seeders)
        {
            Console.WriteLine($"Seeding {seeder.GetType().Name}...");
            await seeder.SeedAsync(connection);
            Console.WriteLine($"{seeder.GetType().Name} seeded.");
        }

        Console.WriteLine("Seed completed successfully.");
    }

    return 0;
}
catch (Exception ex)
{
    Console.Error.WriteLine("Seed failed:");
    Console.Error.WriteLine(ex);
    return 1;
}
