using DBSeed;
using Microsoft.Data.SqlClient;
using DbUp;
using System.Reflection;

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

    // drop and recreate the database
    var useMaster = connection.CreateCommand();
    useMaster.CommandText = "USE master;";
    await useMaster.ExecuteNonQueryAsync();

    var dbName = "Biergarten";
    var dropDb = connection.CreateCommand();
    dropDb.CommandText = $@"
        IF DB_ID(N'{dbName}') IS NOT NULL
        BEGIN
            ALTER DATABASE [{dbName}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
            DROP DATABASE [{dbName}];
        END";
    await dropDb.ExecuteNonQueryAsync();

    var createDb = connection.CreateCommand();
    createDb.CommandText = $@"CREATE DATABASE [{dbName}];";
    await createDb.ExecuteNonQueryAsync();
    await connection.CloseAsync();
    await connection.OpenAsync();


    Console.WriteLine("Connected to database.");

    Console.WriteLine("Starting migrations...");

    // Run Database.Core migrations (embedded resources) via DbUp
    var migrationAssembly = Assembly.Load("Database.Core");
    var upgrader = DeployChanges
        .To.SqlDatabase(connectionString)
        .WithScriptsEmbeddedInAssembly(migrationAssembly)
        .LogToConsole()
        .Build();

    var upgradeResult = upgrader.PerformUpgrade();
    if (!upgradeResult.Successful)
        throw upgradeResult.Error;

    Console.WriteLine("Migrations completed.");


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
    await connection.CloseAsync();
    return 0;
}
catch (Exception ex)
{
    Console.Error.WriteLine("Seed failed:");
    Console.Error.WriteLine(ex);
    return 1;
}
