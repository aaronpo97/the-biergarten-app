using Database.Seed.DatabaseHelpers;
using Database.Seed.Sqlite;
using Database.Seed.SourceDataModels;
using Domain.Entities;
using Features.Auth.Commands.Authentication.RegisterUser;
using Features.Auth.Commands.Profile.UpdateBiography;
using Features.Auth.Commands.Profile.UploadAvatar;
using Features.Auth.Dtos;
using Features.Breweries.Commands.CreateBrewery;
using Features.Locations.Commands.CreateCity;
using Features.Locations.Commands.CreateCountry;
using Features.Locations.Commands.CreateStateProvince;
using Features.Locations.Queries.GetCity;
using Features.Locations.Queries.GetCountry;
using Features.Locations.Queries.GetStateProvince;
using idunno.Password;
using MediatR;
using Microsoft.AspNetCore.Http;
using Spectre.Console;
using City = Database.Seed.SourceDataModels.City;

namespace Database.Seed;

public class BiergartenDataSeeder
{
    private readonly IMediator _mediator;
    private readonly PipelineSeedDataReader _reader;

    public BiergartenDataSeeder(IMediator mediator, PipelineSeedDataReader reader)
    {
        _mediator = mediator;
        _reader = reader;
    }

    public async Task Run(CancellationToken cancellationToken = default)
    {
        AnsiConsole.Write(new Rule("[bold green]Database Seeder[/]").LeftJustified());
        AnsiConsole.MarkupLine("[grey]Connecting to SQLite source and loading seed data...[/]");
        AnsiConsole.WriteLine();

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
                    seedData = await _reader.ReadSeedDataAsync(cancellationToken);
                    ctx.Status($"Done.");
                }
            );

        AnsiConsole.MarkupLine(
            $"[green]✓[/] Loaded [bold]{seedData.Breweries.Count}[/] breweries."
        );
        AnsiConsole.Write(BuildBreweryDisplayTable(seedData.Breweries));

        AnsiConsole.MarkupLine($"[green]✓[/] Loaded [bold]{seedData.Users.Count}[/] users.");
        AnsiConsole.Write(BuildUserDisplayTable(seedData.Users));
        AnsiConsole.WriteLine();

        AnsiConsole.MarkupLine($"[green]✓[/] Loaded [bold]{seedData.Cities.Count}[/] cities.");

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
                    userIds = await LoadUsersIntoDatabaseAsync(seedData.Users, cancellationToken);
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
                    await LoadAvatarsIntoDatabaseAsync(
                        userIds,
                        seedData.Users,
                        ctx,
                        cancellationToken
                    );
                    ctx.Status("Avatar data loaded into target database.");
                }
            );

        await AnsiConsole
            .Status()
            .Spinner(Spinner.Known.Dots)
            .SpinnerStyle(Style.Parse("green"))
            .StartAsync(
                "Loading city data into target database...",
                async ctx =>
                {
                    await LoadCitiesIntoDatabaseAsync(seedData.Cities, ctx, cancellationToken);
                    ctx.Status("City data loaded into target database.");
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
                        seedData.Breweries,
                        userIds,
                        ctx,
                        cancellationToken
                    );
                    ctx.Status("Brewery data loaded into target database.");
                }
            );
    }

    private async Task<IReadOnlyList<Guid>> LoadUsersIntoDatabaseAsync(
        IReadOnlyList<UserRecord> users,
        CancellationToken cancellationToken
    )
    {
        List<Guid> userAccountIds = [];

        foreach (UserRecord userRecord in users)
        {
            cancellationToken.ThrowIfCancellationRequested();

            // allowRepeatedCharacters: true -- 12 unique digits was requested from only 10 possible
            // digit characters (0-9)
            string password = PasswordGenerator.Generate(
                length: 64,
                numberOfDigits: 12,
                numberOfSymbols: 12,
                allowRepeatedCharacters: true
            );

            RegistrationPayload registration = await _mediator.Send(
                new RegisterUserCommand(
                    userRecord.User.Username,
                    userRecord.User.FirstName,
                    userRecord.User.LastName,
                    userRecord.Email,
                    DateTime.Parse(userRecord.DateOfBirth),
                    password
                ),
                cancellationToken
            );

            userAccountIds.Add(registration.UserAccountId);
        }

        return userAccountIds;
    }

    private async Task LoadAvatarsIntoDatabaseAsync(
        IReadOnlyList<Guid> userIds,
        IReadOnlyList<UserRecord> users,
        StatusContext ctx,
        CancellationToken cancellationToken
    )
    {
        for (int i = 0; i < userIds.Count; i++)
        {
            cancellationToken.ThrowIfCancellationRequested();

            ctx.Status($"Loading avatar {i + 1}/{userIds.Count} into target database...");

            Guid userId = userIds[i];

            await _mediator.Send(
                new UpdateBiographyCommand(userId, users[i].User.Bio),
                cancellationToken
            );

            byte[] avatarPng = AvatarGenerator.GeneratePng(userId);

            await using MemoryStream stream = new(avatarPng);
            IFormFile file = new FormFile(stream, 0, stream.Length, "file", $"{userId}.png")
            {
                Headers = new HeaderDictionary(),
                ContentType = "image/png",
            };

            await _mediator.Send(new UploadAvatarCommand(userId, file), cancellationToken);
        }
    }

    private async Task LoadCitiesIntoDatabaseAsync(
        IReadOnlyList<City> cities,
        StatusContext ctx,
        CancellationToken cancellationToken
    )
    {
        Dictionary<string, Guid> countryIdsByIso31661 = [];
        Dictionary<string, Guid> stateProvinceIdsByIso31662 = [];

        foreach (City city in cities)
        {
            cancellationToken.ThrowIfCancellationRequested();

            ctx.Status(
                $"Loading city {city.CityName}, {city.StateProvinceName}, {city.CountryName}..."
            );

            if (!countryIdsByIso31661.TryGetValue(city.ISO_3166_1, out Guid countryId))
            {
                countryId =
                    await _mediator.Send(new GetCountryQuery(city.ISO_3166_1), cancellationToken)
                    ?? await _mediator.Send(
                        new CreateCountryCommand(city.CountryName, city.ISO_3166_1),
                        cancellationToken
                    );
                countryIdsByIso31661[city.ISO_3166_1] = countryId;
            }

            if (!stateProvinceIdsByIso31662.TryGetValue(city.ISO_3166_2, out Guid stateProvinceId))
            {
                stateProvinceId =
                    await _mediator.Send(
                        new GetStateProvinceQuery(city.ISO_3166_2),
                        cancellationToken
                    )
                    ?? await _mediator.Send(
                        new CreateStateProvinceCommand(
                            city.StateProvinceName,
                            city.ISO_3166_2,
                            countryId
                        ),
                        cancellationToken
                    );
                stateProvinceIdsByIso31662[city.ISO_3166_2] = stateProvinceId;
            }

            await _mediator.Send(
                new CreateCityCommand(city.CityName, stateProvinceId),
                cancellationToken
            );
        }
    }

    private async Task LoadBreweriesIntoDatabaseAsync(
        IReadOnlyList<BreweryResult> breweries,
        IReadOnlyList<Guid> posterUserIds,
        StatusContext ctx,
        CancellationToken cancellationToken
    )
    {
        if (posterUserIds.Count == 0)
            throw new InvalidOperationException(
                "Cannot load breweries without any registered users."
            );

        for (int i = 0; i < breweries.Count; i++)
        {
            cancellationToken.ThrowIfCancellationRequested();

            BreweryResult breweryRecord = breweries[i];
            BreweryAddress address =
                breweryRecord.Address
                ?? throw new InvalidOperationException("Brewery address was not loaded.");
            City city =
                address.City ?? throw new InvalidOperationException("Brewery city was not loaded.");

            ctx.Status($"Loading brewery {i + 1}/{breweries.Count} into target database...");

            Guid cityId =
                await _mediator.Send(
                    new GetCityQuery(city.CityName, city.ISO_3166_2),
                    cancellationToken
                )
                ?? throw new InvalidOperationException(
                    $"City '{city.CityName}' "
                        + $"({city.ISO_3166_2}) was not found. "
                        + "Cities must be loaded before breweries."
                );

            await _mediator.Send(
                new CreateBreweryCommand(
                    posterUserIds[i % posterUserIds.Count],
                    breweryRecord.NameEn,
                    breweryRecord.DescriptionEn,
                    new CreateBreweryLocation(
                        cityId,
                        address.AddressLine1,
                        null,
                        address.PostalCode,
                        new CoordinateData(address.Latitude, address.Longitude)
                    )
                ),
                cancellationToken
            );
        }
    }

    private static Table BuildBreweryDisplayTable(IReadOnlyList<BreweryResult> breweries)
    {
        Table table = new Table()
            .AddColumn("Brewery Name (EN)")
            .AddColumn("Brewery Name (Local)")
            .AddColumn("City")
            .AddColumn("State/Province")
            .AddColumn("Country")
            .AddColumn("Longitude")
            .AddColumn("Latitude");

        foreach (BreweryResult brewery in breweries)
        {
            BreweryAddress address =
                brewery.Address
                ?? throw new InvalidOperationException("Brewery address was not loaded.");
            City city =
                address.City ?? throw new InvalidOperationException("Brewery city was not loaded.");

            table.AddRow(
                brewery.NameEn,
                brewery.NameLocal,
                city.CityName,
                city.StateProvinceName,
                city.CountryName,
                address.Longitude.ToString("F6"),
                address.Latitude.ToString("F6")
            );
        }

        return table;
    }

    private static Table BuildUserDisplayTable(IReadOnlyList<UserRecord> users)
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
}
