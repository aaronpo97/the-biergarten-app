using DBSeed;
using Microsoft.Data.SqlClient;

try
{
    var connectionString = Environment.GetEnvironmentVariable(
        "DB_CONNECTION_STRING"
    );
    if (string.IsNullOrWhiteSpace(connectionString))
        throw new InvalidOperationException(
            "Environment variable DB_CONNECTION_STRING is not set or is empty."
        );

    await using var connection = new SqlConnection(connectionString);
    await connection.OpenAsync();

    Console.WriteLine("Connected to database.");

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
    return 0;
}
catch (Exception ex)
{
    Console.Error.WriteLine("Seed failed:");
    Console.Error.WriteLine(ex);
    return 1;
}
