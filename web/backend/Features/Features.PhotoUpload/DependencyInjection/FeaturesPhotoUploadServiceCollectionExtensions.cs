using Features.ImageUploads.Repository;
using Features.ImageUploads.Services;
using Microsoft.Extensions.DependencyInjection;

namespace Features.ImageUploads.DependencyInjection;

/// <summary>Registers the services required by the PhotoUpload feature.</summary>
public static class FeaturesPhotoUploadServiceCollectionExtensions
{
    /// <summary>
    ///     Registers <see cref="IPhotoUploadRepository" /> and <see cref="IFileStorageProvider" /> and their
    ///     implementations.
    /// </summary>
    /// <returns><paramref name="services" />, for chaining.</returns>
    public static IServiceCollection AddFeaturesPhotoUpload(this IServiceCollection services)
    {
        services
            .AddScoped<IPhotoUploadRepository, PhotoUploadRepository>()
            .AddSingleton<IFileStorageProvider, S3FileStorageProvider>();
        return services;
    }
}
