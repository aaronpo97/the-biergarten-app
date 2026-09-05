using Database.Connection.DependencyInjection;
using Database.Seed.DatabaseHelpers;
using Database.Seed.Sqlite;
using Features.Auth.Commands.Profile.UploadAvatar;
using Features.Auth.Services;
using Features.Breweries.Commands.CreateBrewery;
using Features.Breweries.DependencyInjection;
using Features.ImageUploads.Commands.UploadPhoto;
using Features.ImageUploads.DependencyInjection;
using Features.Locations.DependencyInjection;
using Features.Locations.Queries.GetCountry;
using Features.Users.DependencyInjection;
using Infrastructure.FileUpload;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Spectre.Console;

namespace Database.Seed;

internal class Program
{
    private static IMediator CreateMediator()
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

        using ServiceProvider provider = services.BuildServiceProvider();
        return provider.GetRequiredService<IMediator>();
    }

    public static async Task Main()
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
            IMediator mediator = CreateMediator();
            PipelineSeedDataReader reader = new PipelineSeedDataReader(
                connectionString: "Data Source=SeedData/biergarten_seed_2026-08-25T20-45-50.697244Z.sqlite"
            );
            await new BiergartenDataSeeder(mediator, reader).Run(cts.Token);
        }
        catch (OperationCanceledException)
        {
            AnsiConsole.MarkupLine("[yellow]Seeding cancelled.[/]");
        }
        catch (Exception ex)
        {
            AnsiConsole.MarkupLine("[red]Seeding failed.[/]");
            AnsiConsole.WriteException(ex);
        }
    }
}
