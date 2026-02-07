using System.Data;
using System.Reflection;
using DbUp;
using Microsoft.Data.SqlClient;

namespace DataLayer;

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
