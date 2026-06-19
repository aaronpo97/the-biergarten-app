using System.Data;
using System.Reflection;
using DbUp;
using Microsoft.Data.SqlClient;

namespace Database.Migrations;

/// <summary>
/// Entry point for the database migration runner. Reads connection details from
/// environment variables, optionally clears and recreates the target database, and
/// applies all SQL migration scripts embedded in this assembly using DbUp.
/// </summary>
public static class Program
{
    /// <summary>
    /// Builds a SQL Server connection string from the <c>DB_SERVER</c>, <c>DB_NAME</c>,
    /// <c>DB_USER</c>, <c>DB_PASSWORD</c>, and <c>DB_TRUST_SERVER_CERTIFICATE</c>
    /// environment variables.
    /// </summary>
    /// <param name="databaseName">
    /// The database (initial catalog) to connect to. When <c>null</c>, falls back to the
    /// <c>DB_NAME</c> environment variable.
    /// </param>
    /// <returns>A fully built SQL Server connection string.</returns>
    /// <exception cref="InvalidOperationException">
    /// Thrown when <c>DB_SERVER</c>, <c>DB_USER</c>, <c>DB_PASSWORD</c>, or (when
    /// <paramref name="databaseName"/> is <c>null</c>) <c>DB_NAME</c> is not set.
    /// </exception>
    private static string BuildConnectionString(string? databaseName = null)
    {
        var server = Environment.GetEnvironmentVariable("DB_SERVER")
            ?? throw new InvalidOperationException("DB_SERVER environment variable is not set");

        var dbName = databaseName
            ?? Environment.GetEnvironmentVariable("DB_NAME")
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

    /// <summary>The connection string for the target application database (<c>DB_NAME</c>).</summary>
    private static readonly string connectionString = BuildConnectionString();

    /// <summary>The connection string for the <c>master</c> database, used for create/drop operations.</summary>
    private static readonly string masterConnectionString = BuildConnectionString("master");

    /// <summary>
    /// Applies all pending SQL migration scripts embedded in this assembly to the target
    /// database using DbUp, logging progress to the console.
    /// </summary>
    /// <returns><c>true</c> if the upgrade completed successfully; otherwise <c>false</c>.</returns>
    private static bool DeployMigrations()
    {
        var upgrader = DeployChanges
            .To.SqlDatabase(connectionString)
            .WithScriptsEmbeddedInAssembly(Assembly.GetExecutingAssembly())
            .LogToConsole()
            .Build();

        var result = upgrader.PerformUpgrade();
        return result.Successful;
    }

    /// <summary>
    /// Drops the <c>Biergarten</c> database if it exists, first forcing it into single-user
    /// mode with rollback to terminate any existing connections.
    /// </summary>
    /// <returns>
    /// <c>true</c> if the database was dropped (or did not exist) without error; <c>false</c>
    /// if an error occurred while connecting or dropping the database.
    /// </returns>
    private static bool ClearDatabase()
    {
        var myConn = new SqlConnection(masterConnectionString);

        try
        {
            myConn.Open();

            // First, set the database to single user mode to close all connections
            var setModeCommand = new SqlCommand(
                "IF EXISTS (SELECT 1 FROM sys.databases WHERE name = 'Biergarten') " +
                "ALTER DATABASE [Biergarten] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;",
                myConn);
            try
            {
                setModeCommand.ExecuteNonQuery();
                Console.WriteLine("Database set to single user mode.");
            }
            catch (System.Exception ex)
            {
                Console.WriteLine($"Warning: Could not set single user mode: {ex.Message}");
            }

            // Then drop the database
            var dropCommand = new SqlCommand("DROP DATABASE IF EXISTS [Biergarten];", myConn);
            try
            {
                dropCommand.ExecuteNonQuery();
                Console.WriteLine("Database cleared successfully.");
            }
            catch (System.Exception ex)
            {
                Console.WriteLine($"Error dropping database: {ex}");
                return false;
            }
        }
        catch (System.Exception ex)
        {
            Console.WriteLine($"Error clearing database: {ex}");
            return false;
        }
        finally
        {
            if (myConn.State == ConnectionState.Open)
            {
                myConn.Close();
            }
        }
        return true;
    }

    /// <summary>
    /// Creates the <c>Biergarten</c> database on the master connection if it does not
    /// already exist. Errors encountered while creating the database are logged but do
    /// not stop execution.
    /// </summary>
    /// <returns><c>true</c> always; this method does not propagate database errors as a failure result.</returns>
    private static bool CreateDatabaseIfNotExists()
    {
        var myConn = new SqlConnection(masterConnectionString);

        const string str = """
                           IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = 'Biergarten')
                           CREATE DATABASE [Biergarten]
                           """;

        var myCommand = new SqlCommand(str, myConn);
        try
        {
            myConn.Open();
            myCommand.ExecuteNonQuery();
            Console.WriteLine("Database creation command executed successfully.");
        }
        catch (System.Exception ex)
        {
            Console.WriteLine($"Error creating database: {ex}");
        }
        finally
        {
            if (myConn.State == ConnectionState.Open)
            {
                myConn.Close();
            }
        }
        return true;
    }

    /// <summary>
    /// Migration runner entry point. Optionally clears the existing database when the
    /// <c>CLEAR_DATABASE</c> environment variable is set to <c>"true"</c>, ensures the
    /// database exists, then deploys all pending migrations.
    /// </summary>
    /// <param name="args">Command-line arguments (unused).</param>
    /// <returns><c>0</c> if migrations completed successfully; <c>1</c> if they failed or an error occurred.</returns>
    public static int Main(string[] args)
    {
        Console.WriteLine("Starting database migrations...");

        try
        {
            var clearDatabase = Environment.GetEnvironmentVariable("CLEAR_DATABASE");
            if (clearDatabase == "true")
            {
                Console.WriteLine("CLEAR_DATABASE is enabled. Clearing existing database...");
                ClearDatabase();
            }

            CreateDatabaseIfNotExists();
            var success = DeployMigrations();

            if (success)
            {
                Console.WriteLine("Database migrations completed successfully.");
                return 0;
            }
            else
            {
                Console.WriteLine("Database migrations failed.");
                return 1;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine("An error occurred during database migrations:");
            Console.WriteLine(ex.Message);
            return 1;
        }
    }
}
