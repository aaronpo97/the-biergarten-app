using System.Reflection;
using Dapper;
using Database.Connection;
using DbUp;
using DbUp.Engine;
using Microsoft.Data.SqlClient;

namespace Database.Migrations;

/// <summary>
/// Owns the configuration and state for a single database migration run,
/// and performs the drop/create/deploy steps against SQL Server.
/// </summary>
internal sealed class DbMigrator(
    ISqlConnectionFactory standardConnectionStandardConnectionFactory,
    ISqlConnectionFactory masterConnectionConnectionFactory,
    bool clearDatabase)
{
    /// <summary>
    /// Runs the full migration workflow: optional drop, create-if-not-exists,
    /// then deploy DbUp scripts. Throws if the upgrade fails.
    /// </summary>
    public async Task RunAsync(CancellationToken cancellationToken = default)
    {
        if (clearDatabase)
        {
            await DropDatabaseIfExistsAsync(cancellationToken);
        }

        await CreateDatabaseIfNotExistsAsync(cancellationToken);

        DatabaseUpgradeResult result = DeployMigrations();

        if (!result.Successful)
        {
            throw result.Error;
        }
    }

    private async Task DropDatabaseIfExistsAsync(CancellationToken cancellationToken = default)
    {
        string databaseName = ResolveDatabaseName();

        await using SqlConnection connection = masterConnectionConnectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await connection.ExecuteAsync(
            new CommandDefinition(
                """
                DECLARE @statement nvarchar(max) =
                    N'ALTER DATABASE ' + QUOTENAME(@databaseName) + N' SET SINGLE_USER WITH ROLLBACK IMMEDIATE;'
                    + N' DROP DATABASE ' + QUOTENAME(@databaseName) + N';';

                IF EXISTS (SELECT 1 FROM sys.databases WHERE name = @databaseName)
                    EXEC sys.sp_executesql @statement;
                """,
                new { databaseName },
                cancellationToken: cancellationToken
            )
        );

        Console.WriteLine($"Database '{databaseName}' dropped, or did not exist.");
    }

    private async Task CreateDatabaseIfNotExistsAsync(CancellationToken cancellationToken = default)
    {
        string databaseName = ResolveDatabaseName();

        await using SqlConnection connection = masterConnectionConnectionFactory.CreateConnection();
        await connection.OpenAsync(cancellationToken);

        await connection.ExecuteAsync(
            new CommandDefinition(
                """
                DECLARE @statement nvarchar(max);
                IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = @databaseName)
                BEGIN
                    SET @statement = N'CREATE DATABASE ' + QUOTENAME(@databaseName) + N';';
                    EXEC sys.sp_executesql @statement;
                END
                """,
                new { databaseName },
                cancellationToken: cancellationToken
            )
        );

        Console.WriteLine($"Database '{databaseName}' is present.");
    }

    private DatabaseUpgradeResult DeployMigrations()
    {
        UpgradeEngine upgrader = DeployChanges
            .To.SqlDatabase(standardConnectionStandardConnectionFactory.ConnectionString)
            .WithScriptsEmbeddedInAssembly(Assembly.GetExecutingAssembly())
            .WithTransactionPerScript()
            .LogToConsole()
            .Build();

        return upgrader.PerformUpgrade();
    }

    private string ResolveDatabaseName()
    {
        return !SqlConnectionStringHelper.TryGetDatabaseNameFromConnectionString(
            standardConnectionStandardConnectionFactory.ConnectionString,
            out var databaseName
        )
            ? throw new InvalidOperationException(
                "Unable to resolve a database name from the connection string."
            )
            : databaseName;
    }
}
