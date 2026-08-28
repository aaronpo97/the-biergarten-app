using Features.ImageUploads.Repository;
using Microsoft.Extensions.DependencyInjection;

namespace Features.ImageUploads.DependencyInjection;

/// <summary>Registers the services required by the PhotoUpload feature.</summary>
public static class FeaturesPhotoUploadServiceCollectionExtensions
{
    /// <summary>Registers <see cref="IPhotoUploadRepository" /> and its implementation.</summary>
    /// <returns><paramref name="services" />, for chaining.</returns>
    public static IServiceCollection AddFeaturesPhotoUpload(this IServiceCollection services)
    {
        services.AddScoped<IPhotoUploadRepository, PhotoUploadRepository>();
        return services;
    }
}
