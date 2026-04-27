using Microsoft.Data.SqlClient;
using DbUp;
using System.Reflection;
using Database.Seed;

string BuildConnectionString()
{
    var server = Environment.GetEnvironmentVariable("DB_SERVER")
                 ?? throw new InvalidOperationException("DB_SERVER environment variable is not set");

    var dbName = Environment.GetEnvironmentVariable("DB_NAME")
                 ?? throw new InvalidOperationException("DB_NAME environment variable is not set");

    var user = Environment.GetEnvironmentVariable("DB_USER")
               ?? throw new InvalidOperationException("DB_USER environment variable is not set");

    var password = Environment.GetEnvironmentVariable("DB_PASSWORD")
                   ?? throw new InvalidOperationException("DB_PASSWORD environment variable is not set");

    var trustServerCertificate = Environment.GetEnvironmentVariable("DB_TRUST_SERVER_CERTIFICATE")
                                 ?? "True";

    var builder = new SqlConnectionStringBuilder
    {
        DataSource = server,
        InitialCatalog = dbName,
        UserID = user,
        Password = password,
        TrustServerCertificate = bool.Parse(trustServerCertificate),
        Encrypt = true
    };

    return builder.ConnectionString;
}


try
{
    var connectionString = BuildConnectionString();

    Console.WriteLine("Attempting to connect to database...");

    // Retry logic for database connection
    SqlConnection? connection = null;
    int maxRetries = 10;
    int retryDelayMs = 2000;

    for (int attempt = 1; attempt <= maxRetries; attempt++)
    {
        try
        {
            connection = new SqlConnection(connectionString);
            await connection.OpenAsync();
            Console.WriteLine($"Connected to database successfully on attempt {attempt}.");
            break;
        }
        catch (SqlException ex) when (attempt < maxRetries)
        {
            Console.WriteLine($"Connection attempt {attempt}/{maxRetries} failed: {ex.Message}");
            Console.WriteLine($"Retrying in {retryDelayMs}ms...");
            await Task.Delay(retryDelayMs);
            connection?.Dispose();
            connection = null;
        }
    }

    if (connection == null)
    {
        throw new Exception($"Failed to connect to database after {maxRetries} attempts.");
    }

    Console.WriteLine("Starting seeding...");

    using (connection)
    {
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