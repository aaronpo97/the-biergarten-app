using Database.Seed.DatabaseHelpers;
using Database.Seed.PipelineData;
using Database.Seed.Sqlite;
using Domain.Entities;
using Features.Auth.DependencyInjection;
using Features.Auth.Identity;
using Features.Breweries.DependencyInjection;
using Features.Breweries.Repository;
using Features.Locations.DependencyInjection;
using Features.Locations.Dtos;
using Features.Locations.Repository;
using idunno.Password;
using Infrastructure.Sql.DependencyInjection;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Spectre.Console;

return await RunAsync();

static async Task<int> RunAsync()
{
    try
    {
        IConfiguration configuration = new ConfigurationBuilder()
            .AddEnvironmentVariables()
            .Build();

        ServiceCollection services = [];
        services.AddSingleton(configuration);
        services.AddInfrastructureSql();
        services.AddFeaturesBreweries();
        services.AddFeaturesLocations();
        services.AddFeaturesAuth();

        await using ServiceProvider provider = services.BuildServiceProvider();

        IBreweryRepository breweryRepository =
            provider.GetRequiredService<IBreweryRepository>();
        ILocationRepository locationRepository =
            provider.GetRequiredService<ILocationRepository>();
        UserManager<ApplicationUser> userManager =
            provider.GetRequiredService<UserManager<ApplicationUser>>();

        AnsiConsole.Write(new Rule("[bold green]Database Seeder[/]")
            .LeftJustified());
        AnsiConsole.MarkupLine(
            "[grey]Connecting to SQLite source and loading seed data...[/]");
        AnsiConsole.WriteLine();

        PipelineSeedDataReader reader =
            new(ConnectionStrings.SqliteConnectionString);

        SeedData seedData = null!;
        IReadOnlyList<Guid> postedByIds = [];

        await AnsiConsole
            .Status()
            .Spinner(Spinner.Known.Dots)
            .SpinnerStyle(Style.Parse("green"))
            .StartAsync(
                "Loading seed data...",
                async ctx =>
                {
                    seedData = await reader.ReadSeedDataAsync();
                    ctx.Status(
                        $"Loaded {seedData.Breweries.Count} breweries and {seedData.Users.Count} users."
                    );
                }
            );

        AnsiConsole.MarkupLine(
            $"[green]✓[/] Loaded [bold]{seedData.Breweries.Count}[/] breweries."
        );
        AnsiConsole.Write(BuildBreweryTable(seedData.Breweries));
        AnsiConsole.WriteLine();

        AnsiConsole.MarkupLine(
            $"[green]✓[/] Loaded [bold]{seedData.Users.Count}[/] users.");
        AnsiConsole.Write(BuildUserTable(seedData.Users));
        AnsiConsole.WriteLine();

        AnsiConsole.WriteLine("Seed data loaded successfully.");

        AnsiConsole.Write(
            new Rule("[bold green]Loading seed data into target database.[/]")
                .LeftJustified()
        );

        await AnsiConsole
            .Status()
            .Spinner(Spinner.Known.Dots)
            .SpinnerStyle(Style.Parse("green"))
            .StartAsync(
                "Loading user data into target database...",
                async ctx =>
                {
                    postedByIds = await LoadUsersIntoDatabaseAsync(userManager, seedData.Users);
                    ctx.Status("User data loaded into target database.");
                }
            );

        await AnsiConsole
            .Status()
            .Spinner(Spinner.Known.Dots)
            .SpinnerStyle(Style.Parse("green"))
            .StartAsync(
                "Loading brewery data into target database...",
                async ctx =>
                {
                    await LoadBreweriesIntoDatabaseAsync(
                        breweryRepository,
                        locationRepository,
                        seedData.Breweries,
                        postedByIds
                    );
                    ctx.Status("Brewery data loaded into target database.");
                }
            );

        return 0;
    }
    catch (Exception ex)
    {
        AnsiConsole.MarkupLine("[red]Seeding failed.[/]");
        AnsiConsole.WriteException(ex);
        return 1;
    }
}

static async Task<IReadOnlyList<Guid>> LoadUsersIntoDatabaseAsync(
    UserManager<ApplicationUser> userManager,
    IReadOnlyList<UserRecord> users
)
{
    List<Guid> userAccountIds = [];

    foreach (UserRecord userRecord in users)
    {
        ApplicationUser user = new()
        {
            FirstName = userRecord.User.FirstName,
            LastName = userRecord.User.LastName,
            DateOfBirth = DateTime.Parse(userRecord.DateOfBirth),
            UserName = userRecord.User.Username,
            Email = userRecord.Email,
        };

        // allowRepeatedCharacters: true -- 12 unique digits was requested from only 10 possible
        // digit characters (0-9), which idunno.Password rejects outright.
        IdentityResult result = await userManager.CreateAsync(
            user,
            PasswordGenerator.Generate(64, 12, 12, allowRepeatedCharacters: true)
        );

        if (!result.Succeeded)
            throw new InvalidOperationException(
                $"Failed to seed user '{userRecord.User.Username}': "
                    + string.Join("; ", result.Errors.Select(e => e.Description))
            );

        userAccountIds.Add(user.Id);
    }

    return userAccountIds;
}

/// <summary>
///     Persists each <paramref name="breweries" /> record, resolving (and creating, if needed) its
///     Country/StateProvince/City chain via <paramref name="locationRepository" />. The pipeline
///     data has no street-level address or a specific user tied to each brewery, so a placeholder
///     address is used and <c>PostedById</c> is assigned round-robin from <paramref name="posterUserIds" />
///     to keep seeding deterministic across runs.
/// </summary>
static async Task LoadBreweriesIntoDatabaseAsync(
    IBreweryRepository breweryRepository,
    ILocationRepository locationRepository,
    IReadOnlyList<BreweryRecord> breweries,
    IReadOnlyList<Guid> posterUserIds
)
{
    if (posterUserIds.Count == 0)
        throw new InvalidOperationException(
            "Cannot load breweries without any registered users.");

    for (int i = 0; i < breweries.Count; i++)
    {
        BreweryRecord breweryRecord = breweries[i];

        Guid cityId = await locationRepository.GetOrCreateCityIdAsync(
            new CityLocation(
                breweryRecord.Address.City.CityName,
                breweryRecord.Address.City.StateProvince,
                breweryRecord.Address.City.Iso31662,
                breweryRecord.Address.City.Country,
                breweryRecord.Address.City.Iso31661
            )
        );

        await breweryRepository.CreateAsync(
            new BreweryPost
            {
                BreweryPostId = Guid.NewGuid(),
                BreweryName = breweryRecord.Brewery.NameEn,
                Description = breweryRecord.Brewery.DescriptionEn,
                PostedById = posterUserIds[i % posterUserIds.Count],
                Location = new BreweryPostLocation
                {
                    BreweryPostLocationId = Guid.NewGuid(),
                    CityId = cityId,
                    AddressLine1 = "Address unavailable",
                    PostalCode = breweryRecord.Address.PostalCode,
                },
            }
        );
    }
}

static Table BuildBreweryTable(IReadOnlyList<BreweryRecord> breweries)
{
    Table table = new Table()
        .AddColumn("Brewery Name (EN)")
        .AddColumn("Brewery Name (Local)")
        .AddColumn("City")
        .AddColumn("State/Province")
        .AddColumn("Country")
        .AddColumn("Postal Code");

    foreach (BreweryRecord brewery in breweries)
    {
        table.AddRow(
            brewery.Brewery.NameEn,
            brewery.Brewery.NameLocal,
            brewery.Address.City.CityName,
            brewery.Address.City.StateProvince,
            brewery.Address.City.Country,
            brewery.Address.PostalCode
        );
    }

    return table;
}

static Table BuildUserTable(IReadOnlyList<UserRecord> users)
{
    Table table = new Table()
        .AddColumn("Username")
        .AddColumn("First Name")
        .AddColumn("Last Name")
        .AddColumn("Email")
        .AddColumn("Date of Birth");

    foreach (UserRecord user in users)
    {
        table.AddRow(
            user.User.Username,
            user.User.FirstName,
            user.User.LastName,
            user.Email,
            user.DateOfBirth
        );
    }

    return table;
}