using Database.Seed.DatabaseHelpers;
using Database.Seed.PipelineData;
using Database.Seed.Sqlite;
using Microsoft.Data.Sqlite;

namespace Database.Seed;

public class Program
{
    public static int Main()
    {
        IReadOnlyList<BreweryRecord> breweries;
        IReadOnlyList<UserRecord> users;
        try
        {
            PipelineSeedDataReader reader = new(ConnectionStrings.SqliteConnectionString);
            breweries = reader.ReadBreweryRecords();
            users = reader.ReadUserRecords();
        }
        catch (SqliteException ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"Error opening database connection: {ex.Message}");
            Console.ResetColor();
            return 1;
        }


        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine(
            $"Loaded {breweries.Count} breweries."
        );
        Console.ResetColor();

        for (int i = 0; i < breweries.Count; i++)
        {
            BreweryRecord brewery = breweries[i];
            Console.WriteLine($"{i + 1}:\t{brewery.Brewery.NameEn}\t({brewery.Address.City.CityName}, {brewery.Address.City.Country})");
        }
        Console.ForegroundColor = ConsoleColor.Green;
        Console.WriteLine($"Loaded {users.Count} users.");
        Console.ResetColor();

        for (int i = 0; i < users.Count; i++)
        {
            UserRecord user = users[i];
            Console.WriteLine($"{i + 1}:\t{user.User.FirstName} {user.User.LastName}\t ({user.Email})");
        }

        return 0;

    }
}
