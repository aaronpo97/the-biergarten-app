using Database.Seed.DatabaseHelpers;
using Database.Seed.PipelineData;
using Database.Seed.Sqlite;
using Domain.Entities;
using Features.Auth.DependencyInjection;
using Features.Auth.Dtos;
using Features.Auth.Repository;
using Features.Breweries.DependencyInjection;
using Features.Breweries.Repository;
using idunno.Password;
using Infrastructure.PasswordHashing;
using Infrastructure.Sql;
using Microsoft.Data.Sqlite;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

static async Task<int> main()
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

    ServiceCollection services = [];
    services.AddSingleton<IConfiguration>(new ConfigurationBuilder().Build());
    services.AddSingleton<ISqlConnectionFactory, DefaultSqlConnectionFactory>();
    services.AddFeaturesBreweries();
    services.AddFeaturesAuth();

    using ServiceProvider provider = services.BuildServiceProvider();

    IBreweryRepository breweryRepository;
    IAuthRepository authRepository;
    IPasswordInfrastructure passwordInfrastructure;
    try
    {
        breweryRepository = provider.GetRequiredService<IBreweryRepository>();
        authRepository = provider.GetRequiredService<IAuthRepository>();
        passwordInfrastructure = provider.GetRequiredService<IPasswordInfrastructure>();
    }
    catch (InvalidOperationException ex)
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine($"Error configuring database connection: {ex.Message}");
        Console.ResetColor();
        return 1;
    }

    Console.ForegroundColor = ConsoleColor.Green;
    Console.WriteLine($"Loaded {breweries.Count} breweries.");
    Console.ResetColor();

    for (int i = 0; i < breweries.Count; i++)
    {
        BreweryRecord brewery = breweries[i];
        Console.WriteLine(
            $"{i + 1}:\t{brewery.Brewery.NameEn}\t({brewery.Address.City.CityName}, {brewery.Address.City.Country})"
        );
    }

    Console.ForegroundColor = ConsoleColor.Green;
    Console.WriteLine($"Loaded {users.Count} users.");
    Console.ResetColor();

    foreach (UserRecord user in users)
    {
        string username = user.User.Username;
        string firstName = user.User.FirstName;
        string lastName = user.User.LastName;
        string email = user.Email;
        DateTime dateOfBirth = DateTime.Parse(user.DateOfBirth);

        // Generate a password that is 64 characters long with 10 digits, 10 symbols,
        // allowing upper and lower case letters, disallowing repeat characters.
        string generatedPassword = PasswordGenerator.Generate(
            length: 64,
            numberOfDigits: 10,
            numberOfSymbols: 10
        );
        string hashedPassword = passwordInfrastructure.Hash(generatedPassword);

        UserRegistrationDto registrationDto = new(
            username,
            firstName,
            lastName,
            email,
            dateOfBirth,
            hashedPassword
        );

        try
        {
            UserAccount createdUser = await authRepository.RegisterUserAsync(registrationDto);
            Console.WriteLine(
                $"Created user: {createdUser.Username} ({createdUser.UserAccountId})"
            );
        }
        catch (Exception ex)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.WriteLine($"Error creating user {username}: {ex.Message}");
            Console.ResetColor();
        }
    }

    return 0;
}

return await main();
