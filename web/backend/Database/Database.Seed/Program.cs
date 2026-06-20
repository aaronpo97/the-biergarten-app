using Database.Seed;
using Microsoft.Data.SqlClient;

// Entry point for the database seeding utility. Connects to the target database
// (retrying on transient failures), then runs each registered ISeeder in order to
// populate location and user data.

/// <summary>
/// Builds a SQL Server connection string from the <c>DB_SERVER</c>, <c>DB_NAME</c>,
/// <c>DB_USER</c>, <c>DB_PASSWORD</c>, and <c>DB_TRUST_SERVER_CERTIFICATE</c>
/// environment variables.
/// </summary>
/// <returns>A fully built SQL Server connection string.</returns>
/// <exception cref="InvalidOperationException">
/// Thrown when <c>DB_SERVER</c>, <c>DB_NAME</c>, <c>DB_USER</c>, or <c>DB_PASSWORD</c>
/// is not set.
/// </exception>
string BuildConnectionString()
{
    string server = Environment.GetEnvironmentVariable("DB_SERVER")
                    ?? throw new InvalidOperationException("DB_SERVER environment variable is not set");

    string dbName = Environment.GetEnvironmentVariable("DB_NAME")
                    ?? throw new InvalidOperationException("DB_NAME environment variable is not set");

    string user = Environment.GetEnvironmentVariable("DB_USER")
                  ?? throw new InvalidOperationException("DB_USER environment variable is not set");

    string password = Environment.GetEnvironmentVariable("DB_PASSWORD")
                      ?? throw new InvalidOperationException("DB_PASSWORD environment variable is not set");

    string trustServerCertificate = Environment.GetEnvironmentVariable("DB_TRUST_SERVER_CERTIFICATE")
                                    ?? "True";

    SqlConnectionStringBuilder builder = new()
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
    string connectionString = BuildConnectionString();

    Console.WriteLine("Attempting to connect to database...");

    // Retry logic for database connection
    SqlConnection? connection = null;
    int maxRetries = 10;
    int retryDelayMs = 2000;

    for (int attempt = 1; attempt <= maxRetries; attempt++)
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

    if (connection == null) throw new Exception($"Failed to connect to database after {maxRetries} attempts.");

    Console.WriteLine("Starting seeding...");

    using (connection)
    {
        ISeeder[] seeders =
        [
            new LocationSeeder(),
            new UserSeeder()
        ];

        foreach (ISeeder seeder in seeders)
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