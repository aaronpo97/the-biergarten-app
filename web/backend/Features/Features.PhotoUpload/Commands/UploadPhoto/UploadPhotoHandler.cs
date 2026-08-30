using Domain.Entities;
using Features.ImageUploads.Repository;
using Infrastructure.FileUpload;
using MediatR;

namespace Features.ImageUploads.Commands.UploadPhoto;

/// <summary>Handles <see cref="UploadPhotoCommand" />.</summary>
public class UploadPhotoHandler(
    IFileStorageProvider fileStorageProvider,
    IPhotoUploadRepository photoUploadRepository
) : IRequestHandler<UploadPhotoCommand, Guid>
{
    public async Task<Guid> Handle(UploadPhotoCommand request, CancellationToken cancellationToken)
    {
        Guid photoId = Guid.NewGuid();
        string key = $"{request.Key}/{photoId}";

        await using Stream stream = request.File.OpenReadStream();

        await fileStorageProvider.UploadAsync(
            key,
            stream,
            request.File.ContentType,
            cancellationToken
        );

        Photo photo = new() { Hyperlink = key, UploadedById = request.UploadedById };

        await photoUploadRepository.CreateAsync(photo, cancellationToken);

        return photoId;
    }
}
