using System.Data;
using System.Reflection;
using DbUp;
using Microsoft.Data.SqlClient;

namespace Database.Migrations;

public static class Program
{
    private static readonly string? connectionString = Environment.GetEnvironmentVariable("DB_CONNECTION_STRING");
    private static readonly string? masterConnectionString = Environment.GetEnvironmentVariable("MASTER_DB_CONNECTION_STRING");

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
