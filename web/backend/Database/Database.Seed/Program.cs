using Database.Connection.DependencyInjection;
using Database.Seed.DatabaseHelpers;
using Database.Seed.PipelineData;
using Database.Seed.Sqlite;
using Domain.Entities;
using Features.Auth.Commands.Authentication.RegisterUser;
using Features.Auth.Commands.Profile.UpdateBiography;
using Features.Auth.Commands.Profile.UploadAvatar;
using Features.Users.DependencyInjection;
using Features.Auth.Dtos;
using Features.Auth.Services;
using Features.Breweries.Commands.CreateBrewery;
using Features.Breweries.DependencyInjection;
using Features.ImageUploads.Commands.UploadPhoto;
using Features.ImageUploads.DependencyInjection;
using Features.Locations.Commands.CreateCity;
using Features.Locations.Commands.CreateCountry;
using Features.Locations.Commands.CreateStateProvince;
using Features.Locations.DependencyInjection;
using Features.Locations.Queries.GetCity;
using Features.Locations.Queries.GetCountry;
using Features.Locations.Queries.GetStateProvince;
using idunno.Password;
using Infrastructure.FileUpload;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Spectre.Console;

return await RunAsync();

static async Task<int> RunAsync()
{
    try
    {
        IConfiguration configuration = new ConfigurationBuilder().AddEnvironmentVariables().Build();

        IServiceCollection services = new ServiceCollection()
            .AddSingleton(configuration)
            .AddDatabaseConnection()
            .AddFeaturesBreweries()
            .AddFeaturesLocations()
            .AddFeaturesUsers()
            .AddFeaturesPhotoUpload()
            .AddSingleton<IFileStorageProvider, S3FileStorageProvider>()
            .AddScoped<ITokenService, NoOpTokenService>()
            .AddMediatR(cfg =>
                cfg.RegisterServicesFromAssemblyContaining<CreateBreweryCommand>()
                    .RegisterServicesFromAssemblyContaining<GetCountryQuery>()
                    .RegisterServicesFromAssemblyContaining<UploadAvatarCommand>()
                    .RegisterServicesFromAssemblyContaining<UploadPhotoCommand>()
            );

        await using ServiceProvider provider = services.BuildServiceProvider();
        IMediator mediator = provider.GetRequiredService<IMediator>();

        AnsiConsole.Write(new Rule("[bold green]Database Seeder[/]").LeftJustified());
        AnsiConsole.MarkupLine("[grey]Connecting to SQLite source and loading seed data...[/]");
        AnsiConsole.WriteLine();

        PipelineSeedDataReader reader = new(ConnectionStrings.SqliteConnectionString);

        SeedData seedData = null!;
        IReadOnlyList<Guid> userIds = [];

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
        AnsiConsole.Write(BuildBreweryDisplayTable(seedData.Breweries));
        AnsiConsole.WriteLine();

        AnsiConsole.MarkupLine($"[green]✓[/] Loaded [bold]{seedData.Users.Count}[/] users.");
        AnsiConsole.Write(BuildUserDisplayTable(seedData.Users));
        AnsiConsole.WriteLine();

        AnsiConsole.WriteLine("Seed data loaded successfully.");

        AnsiConsole.Write(
            new Rule("[bold green]Loading seed data into target database.[/]").LeftJustified()
        );

        await AnsiConsole
            .Status()
            .Spinner(Spinner.Known.Dots)
            .SpinnerStyle(Style.Parse("green"))
            .StartAsync(
                "Loading user data into target database...",
                async ctx =>
                {
                    userIds = await LoadUsersIntoDatabaseAsync(mediator, seedData.Users);
                    ctx.Status("User data loaded into target database.");
                }
            );

        await AnsiConsole
            .Status()
            .Spinner(Spinner.Known.Dots)
            .SpinnerStyle(Style.Parse("green"))
            .StartAsync(
                "Loading avatars into target database...",
                async ctx =>
                {
                    await LoadAvatarsIntoDatabaseAsync(mediator, userIds, seedData.Users, ctx);
                    ctx.Status("Avatar data loaded into target database.");
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
                        mediator,
                        seedData.Breweries,
                        userIds,
                        ctx
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
    IMediator mediator,
    IReadOnlyList<UserRecord> users
)
{
    List<Guid> userAccountIds = [];

    foreach (UserRecord userRecord in users)
    {
        // allowRepeatedCharacters: true -- 12 unique digits was requested from only 10 possible
        // digit characters (0-9), which idunno.Password rejects outright.
        string password = PasswordGenerator.Generate(64, 12, 12, allowRepeatedCharacters: true);

        RegistrationPayload registration = await mediator.Send(
            new RegisterUserCommand(
                userRecord.User.Username,
                userRecord.User.FirstName,
                userRecord.User.LastName,
                userRecord.Email,
                DateTime.Parse(userRecord.DateOfBirth),
                password
            )
        );

        userAccountIds.Add(registration.UserAccountId);
    }

    return userAccountIds;
}

static async Task LoadAvatarsIntoDatabaseAsync(
    IMediator mediator,
    IReadOnlyList<Guid> userIds,
    IReadOnlyList<UserRecord> users,
    StatusContext ctx
)
{
    for (int i = 0; i < userIds.Count; i++)
    {
        ctx.Status($"Loading avatar {i + 1}/{userIds.Count} into target database...");

        Guid userId = userIds[i];

        await mediator.Send(new UpdateBiographyCommand(userId, users[i].User.Bio));

        byte[] avatarPng = AvatarGenerator.GeneratePng(userId);

        await using MemoryStream stream = new(avatarPng);
        IFormFile file = new FormFile(stream, 0, stream.Length, "file", $"{userId}.png")
        {
            Headers = new HeaderDictionary(),
            ContentType = "image/png",
        };

        await mediator.Send(new UploadAvatarCommand(userId, file));
    }
}

static async Task LoadBreweriesIntoDatabaseAsync(
    IMediator mediator,
    IReadOnlyList<BreweryRecord> breweries,
    IReadOnlyList<Guid> posterUserIds,
    StatusContext ctx
)
{
    if (posterUserIds.Count == 0)
        throw new InvalidOperationException("Cannot load breweries without any registered users.");

    for (int i = 0; i < breweries.Count; i++)
    {
        BreweryRecord breweryRecord = breweries[i];

        ctx.Status($"Loading brewery {i + 1}/{breweries.Count} into target database...");

        Guid countryId =
            await mediator.Send(new GetCountryQuery(breweryRecord.Address.City.Iso31661))
            ?? await mediator.Send(
                new CreateCountryCommand(
                    breweryRecord.Address.City.Country,
                    breweryRecord.Address.City.Iso31661
                )
            );

        Guid stateProvinceId =
            await mediator.Send(new GetStateProvinceQuery(breweryRecord.Address.City.Iso31662))
            ?? await mediator.Send(
                new CreateStateProvinceCommand(
                    breweryRecord.Address.City.StateProvince,
                    breweryRecord.Address.City.Iso31662,
                    countryId
                )
            );

        Guid cityId =
            await mediator.Send(
                new GetCityQuery(
                    breweryRecord.Address.City.CityName,
                    breweryRecord.Address.City.Iso31662
                )
            )
            ?? await mediator.Send(
                new CreateCityCommand(breweryRecord.Address.City.CityName, stateProvinceId)
            );

        await mediator.Send(
            new CreateBreweryCommand(
                posterUserIds[i % posterUserIds.Count],
                breweryRecord.Brewery.NameEn,
                breweryRecord.Brewery.DescriptionEn,
                new CreateBreweryLocation(
                    cityId,
                    breweryRecord.Address.AddressLine1,
                    null,
                    breweryRecord.Address.PostalCode,
                    new CoordinateData(
                        breweryRecord.Address.Latitude,
                        breweryRecord.Address.Longitude
                    )
                )
            )
        );
    }
}

static Table BuildBreweryDisplayTable(IReadOnlyList<BreweryRecord> breweries)
{
    Table table = new Table()
        .AddColumn("Brewery Name (EN)")
        .AddColumn("Brewery Name (Local)")
        .AddColumn("City")
        .AddColumn("State/Province")
        .AddColumn("Country")
        .AddColumn("Longitude")
        .AddColumn("Latitude");

    foreach (BreweryRecord brewery in breweries)
    {
        table.AddRow(
            brewery.Brewery.NameEn,
            brewery.Brewery.NameLocal,
            brewery.Address.City.CityName,
            brewery.Address.City.StateProvince,
            brewery.Address.City.Country,
            brewery.Address.Longitude.ToString("F6"),
            brewery.Address.Latitude.ToString("F6")
        );
    }

    return table;
}

static Table BuildUserDisplayTable(IReadOnlyList<UserRecord> users)
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
