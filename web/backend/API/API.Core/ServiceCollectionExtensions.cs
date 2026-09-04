using API.Core.Authentication;
using Database.Connection.DependencyInjection;
using Features.Auth.Controllers;
using Features.Breweries.Controllers;
using Features.Breweries.DependencyInjection;
using Features.Emails.DependencyInjection;
using Features.Emails.Services;
using Features.ImageUploads.Commands.UploadPhoto;
using Features.ImageUploads.DependencyInjection;
using Features.Locations.Controllers;
using Features.Locations.DependencyInjection;
using Features.Users.DependencyInjection;
using FluentValidation;
using FluentValidation.AspNetCore;
using Infrastructure.FileUpload;
using Infrastructure.Jwt;
using Microsoft.OpenApi.Models;
using Shared.Application.Behaviors;

namespace API.Core;

internal static class ServiceCollectionExtensions
{
    extension(IServiceCollection services)
    {
        public IServiceCollection AddApiControllers() =>
            services
                .AddControllers(options => options.Filters.Add<GlobalExceptionFilter>())
                .AddApplicationPart(typeof(BreweryController).Assembly)
                .AddApplicationPart(typeof(AuthController).Assembly)
                .AddApplicationPart(typeof(CityController).Assembly)
                .Services;

        public IServiceCollection AddValidationAndMediatR()
        {
            services
                .AddOpenApi()
                .AddValidatorsFromAssemblyContaining<Program>()
                .AddValidatorsFromAssembly(typeof(BreweryController).Assembly)
                .AddValidatorsFromAssembly(typeof(AuthController).Assembly)
                .AddValidatorsFromAssembly(typeof(UploadPhotoCommand).Assembly)
                .AddFluentValidationAutoValidation()
                .AddMediatR(cfg =>
                {
                    cfg.RegisterServicesFromAssemblyContaining<Program>();
                    cfg.RegisterServicesFromAssembly(typeof(BreweryController).Assembly);
                    cfg.RegisterServicesFromAssembly(typeof(AuthController).Assembly);
                    cfg.RegisterServicesFromAssembly(typeof(UploadPhotoCommand).Assembly);
                    cfg.RegisterServicesFromAssembly(typeof(IEmailDispatcher).Assembly);
                    cfg.RegisterServicesFromAssembly(typeof(CityController).Assembly);
                    cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
                });

            return services;
        }

        public IServiceCollection AddApplicationServices()
        {
            services
                .AddEndpointsApiExplorer()
                .AddSwaggerGen(options =>
                {
                    options.AddSecurityDefinition(
                        "Bearer",
                        new OpenApiSecurityScheme
                        {
                            Name = "Authorization",
                            Type = SecuritySchemeType.Http,
                            Scheme = "Bearer",
                            BearerFormat = "JWT",
                            In = ParameterLocation.Header,
                            Description = "Enter a JWT access token.",
                        }
                    );
                    options.AddSecurityRequirement(
                        new OpenApiSecurityRequirement
                        {
                            {
                                new OpenApiSecurityScheme
                                {
                                    Reference = new OpenApiReference
                                    {
                                        Type = ReferenceType.SecurityScheme,
                                        Id = "Bearer",
                                    },
                                },
                                []
                            },
                        }
                    );
                });

            services.AddHealthChecks();
            return services;
        }

        public IServiceCollection AddFeatureModules() =>
            services
                .AddDatabaseConnection()
                .AddFeaturesBreweries()
                .AddFeaturesUsers()
                .AddFeaturesEmails()
                .AddFeaturesPhotoUpload()
                .AddFeaturesLocations();

        public IServiceCollection AddCoreInfrastructure() =>
            services
                // ITokenInfrastructure is registered here because JwtAuthenticationHandler depends on it directly.
                .AddScoped<ITokenInfrastructure, JwtInfrastructure>()
                .AddSingleton<IFileStorageProvider, S3FileStorageProvider>()
                .AddScoped<GlobalExceptionFilter>();

        public IServiceCollection AddJwtAuthentication()
        {
            services
                .AddAuthentication("JWT")
                .AddScheme<JwtAuthenticationOptions, JwtAuthenticationHandler>(
                    "JWT",
                    options => { }
                );

            services.AddAuthorization();
            return services;
        }
    }
}
