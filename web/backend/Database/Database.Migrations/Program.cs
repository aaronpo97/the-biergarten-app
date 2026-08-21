using System.Data;
using System.Reflection;
using DbUp;
using DbUp.Engine;
using Infrastructure.Sql;
using Microsoft.Data.SqlClient;

namespace Database.Migrations;

/// <summary>
///     Entry point for the database migration runner. Reads connection details from environment
///     variables, optionally drops and recreates the target database, and applies all SQL
///     migration scripts embedded in this assembly using DbUp.
/// </summary>
public static class Program
{
    /// <summary>
    ///     Migration runner entry point. Drops the target database when <c>CLEAR_DATABASE</c> is
    ///     set to <c>true</c>, ensures the database exists, then deploys all pending migrations.
    /// </summary>
    /// <returns>
    ///     <c>0</c> if migrations completed successfully; <c>1</c> if they failed or an error occurred.
    /// </returns>
    public static async Task<int> Main()
    {
        Console.WriteLine("Starting database migrations...");

        try
        {
            DatabaseSettings settings = DatabaseSettings.FromEnvironment();

            if (settings.ClearDatabase)
            {
                Console.WriteLine(
                    $"CLEAR_DATABASE is enabled. Dropping database '{settings.DatabaseName}'..."
                );
                await DropDatabaseIfExistsAsync(settings);
            }

            await CreateDatabaseIfNotExistsAsync(settings);

            return DeployMigrations(settings.ConnectionString) ? 0 : 1;
        }
        catch (Exception ex) when (ex is InvalidOperationException or SqlException)
        {
            Console.Error.WriteLine("An error occurred during database migrations:");
            Console.Error.WriteLine(ex.Message);
            return 1;
        }
    }

    /// <summary>
    ///     Drops the target database if it exists, first forcing it into single-user mode with
    ///     rollback immediate so that any existing connections are terminated.
    /// </summary>
    /// <param name="settings">The resolved database settings.</param>
    /// <exception cref="SqlException">Thrown if the connection or the drop operation fails.</exception>
    private static async Task DropDatabaseIfExistsAsync(DatabaseSettings settings)
    {
        const string sql = """
            DECLARE @statement nvarchar(max);

            IF EXISTS (SELECT 1 FROM sys.databases WHERE name = @databaseName)
            BEGIN
                SET @statement =
                    N'ALTER DATABASE ' + QUOTENAME(@databaseName)
                    + N' SET SINGLE_USER WITH ROLLBACK IMMEDIATE;';
                EXEC sys.sp_executesql @statement;

                SET @statement = N'DROP DATABASE ' + QUOTENAME(@databaseName) + N';';
                EXEC sys.sp_executesql @statement;
            END
            """;

        await ExecuteNonQueryAsync(settings.MasterConnectionString, sql, settings.DatabaseName);
        Console.WriteLine($"Database '{settings.DatabaseName}' dropped, or did not exist.");
    }

    /// <summary>
    ///     Creates the target database on the <c>master</c> connection if it does not already exist.
    /// </summary>
    /// <param name="settings">The resolved database settings.</param>
    /// <exception cref="SqlException">Thrown if the connection or the create operation fails.</exception>
    private static async Task CreateDatabaseIfNotExistsAsync(DatabaseSettings settings)
    {
        const string sql = """
            DECLARE @statement nvarchar(max);

            IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = @databaseName)
            BEGIN
                SET @statement = N'CREATE DATABASE ' + QUOTENAME(@databaseName) + N';';
                EXEC sys.sp_executesql @statement;
            END
            """;

        await ExecuteNonQueryAsync(settings.MasterConnectionString, sql, settings.DatabaseName);
        Console.WriteLine($"Database '{settings.DatabaseName}' is present.");
    }

    /// <param name="databaseName">The value bound to the <c>@databaseName</c> parameter.</param>
    private static async Task ExecuteNonQueryAsync(
        string connectionString,
        string sql,
        string databaseName
    )
    {
        await using SqlConnection connection = new(connectionString);
        await connection.OpenAsync();

        await using SqlCommand command = new(sql, connection);
        command.Parameters.Add("@databaseName", SqlDbType.NVarChar, 128).Value = databaseName;

        await command.ExecuteNonQueryAsync();
    }

    /// <summary>
    ///     Applies all pending SQL migration scripts embedded in this assembly to the target
    ///     database using DbUp, logging progress to the console.
    /// </summary>
    /// <param name="connectionString">The connection string for the target application database.</param>
    /// <returns><c>true</c> if the upgrade completed successfully; otherwise <c>false</c>.</returns>
    private static bool DeployMigrations(string connectionString)
    {
        UpgradeEngine upgrader = DeployChanges
            .To.SqlDatabase(connectionString)
            .WithScriptsEmbeddedInAssembly(Assembly.GetExecutingAssembly())
            .WithTransactionPerScript()
            .LogToConsole()
            .Build();

        DatabaseUpgradeResult result = upgrader.PerformUpgrade();

        if (result.Successful)
        {
            Console.WriteLine("Database migrations completed successfully.");
            return true;
        }

        Console.Error.WriteLine($"Database migrations failed: {result.Error}");
        return false;
    }

    /// <summary>
    ///     Connection details and runtime options resolved from environment variables.
    /// </summary>
    /// <param name="ConnectionString">The connection string for the target application database.</param>
    /// <param name="MasterConnectionString">
    ///     The connection string for the <c>master</c> database, used for create and drop operations.
    /// </param>
    /// <param name="DatabaseName">The name of the target application database.</param>
    /// <param name="ClearDatabase">Whether the target database should be dropped before migrating.</param>
    private sealed record DatabaseSettings(
        string ConnectionString,
        string MasterConnectionString,
        string DatabaseName,
        bool ClearDatabase
    )
    {
        /// <summary>
        ///     Builds the settings from the <c>DB_SERVER</c>, <c>DB_NAME</c>, <c>DB_USER</c>,
        ///     <c>DB_PASSWORD</c>, <c>DB_TRUST_SERVER_CERTIFICATE</c>, and <c>CLEAR_DATABASE</c>
        ///     environment variables.
        /// </summary>
        /// <exception cref="InvalidOperationException">
        ///     Thrown when a required environment variable is not set.
        /// </exception>
        public static DatabaseSettings FromEnvironment()
        {
            string databaseName =
                Environment.GetEnvironmentVariable("DB_NAME")
                ?? throw new InvalidOperationException(
                    "The DB_NAME environment variable is not set."
                );

            bool clearDatabase = string.Equals(
                Environment.GetEnvironmentVariable("CLEAR_DATABASE"),
                "true",
                StringComparison.OrdinalIgnoreCase
            );

            return new DatabaseSettings(
                SqlConnectionStringHelper.BuildConnectionString(databaseName),
                SqlConnectionStringHelper.BuildMasterConnectionString(),
                databaseName,
                clearDatabase
            );
        }
    }
}
