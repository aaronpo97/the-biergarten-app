using Database.Connection.DependencyInjection;
using Database.Seed.DatabaseHelpers;
using Database.Seed.Sqlite;
using Features.Breweries.Commands.CreateBrewery;
using Features.Breweries.DependencyInjection;
using Features.ImageUploads.Commands.UploadPhoto;
using Features.ImageUploads.DependencyInjection;
using Features.Locations.DependencyInjection;
using Features.Locations.Queries.GetCountry;
using Features.Users.Commands.Profile.UploadAvatar;
using Features.Users.DependencyInjection;
using Features.Users.Services;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Spectre.Console;

namespace Database.Seed;

internal class Program
{
    private static ServiceProvider BuildServiceProvider()
    {
        IConfiguration configuration = new ConfigurationBuilder().AddEnvironmentVariables().Build();

        IServiceCollection services = new ServiceCollection()
            .AddSingleton(configuration)
            .AddDatabaseConnection()
            .AddFeaturesBreweries()
            .AddFeaturesLocations()
            .AddFeaturesUsers()
            .AddFeaturesPhotoUpload()
            .AddScoped<ITokenService, NoOpTokenService>()
            .AddMediatR(cfg =>
                cfg.RegisterServicesFromAssemblyContaining<CreateBreweryCommand>()
                    .RegisterServicesFromAssemblyContaining<GetCountryQuery>()
                    .RegisterServicesFromAssemblyContaining<UploadAvatarCommand>()
                    .RegisterServicesFromAssemblyContaining<UploadPhotoCommand>()
            );

        return services.BuildServiceProvider();
    }

    public static async Task<int> Main()
    {
        using CancellationTokenSource cts = new();
        Console.CancelKeyPress += (_, e) =>
        {
            e.Cancel = true;
            // ReSharper disable once AccessToDisposedClosure
            cts.Cancel();
        };

        try
        {
            await using ServiceProvider provider = BuildServiceProvider();
            IMediator mediator = provider.GetRequiredService<IMediator>();
            SeedRepository reader = new SeedRepository(
                connectionString: "Data Source=SeedData/biergarten_seed_2026-08-25T20-45-50.697244Z.sqlite"
            );
            await new BiergartenDataSeeder(mediator, reader).Run(cts.Token);
            return 0;
        }
        catch (OperationCanceledException)
        {
            AnsiConsole.MarkupLine("[yellow]Seeding cancelled.[/]");
            return 1;
        }
        catch (Exception ex)
        {
            AnsiConsole.MarkupLine("[red]Seeding failed.[/]");
            AnsiConsole.WriteException(ex);
            return 1;
        }
    }
}
