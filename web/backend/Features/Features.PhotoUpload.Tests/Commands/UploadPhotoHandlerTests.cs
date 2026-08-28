using Domain.Entities;
using Features.ImageUploads.Commands.UploadPhoto;
using Features.ImageUploads.Repository;
using FluentAssertions;
using Infrastructure.FileUpload;
using Microsoft.AspNetCore.Http;
using Moq;

namespace Features.PhotoUpload.Tests.Commands;

public class UploadPhotoHandlerTests
{
    private readonly Mock<IFileStorageProvider> _fileStorageProviderMock = new();
    private readonly UploadPhotoHandler _handler;
    private readonly Mock<IPhotoUploadRepository> _repoMock = new();

    public UploadPhotoHandlerTests()
    {
        _handler = new UploadPhotoHandler(_fileStorageProviderMock.Object, _repoMock.Object);
    }

    private static Mock<IFormFile> ValidFile(
        string content = "fake-image-bytes",
        string contentType = "image/png"
    )
    {
        Mock<IFormFile> file = new();
        byte[] bytes = System.Text.Encoding.UTF8.GetBytes(content);
        file.Setup(f => f.OpenReadStream()).Returns(() => new MemoryStream(bytes));
        file.Setup(f => f.ContentType).Returns(contentType);
        file.Setup(f => f.Length).Returns(bytes.Length);
        return file;
    }

    [Fact]
    public async Task Handle_UploadsFileUnderRequestedKey_AndPersistsPhoto_ReturnsNewPhotoId()
    {
        Mock<IFormFile> file = ValidFile();
        UploadPhotoCommand command = new(Guid.NewGuid(), "breweries/some-brewery-id", file.Object);

        string? uploadedKey = null;
        string? uploadedContentType = null;
        _fileStorageProviderMock
            .Setup(p =>
                p.UploadAsync(
                    It.IsAny<string>(),
                    It.IsAny<Stream>(),
                    It.IsAny<string>(),
                    It.IsAny<CancellationToken>()
                )
            )
            .Callback<string, Stream, string, CancellationToken>(
                (key, _, contentType, _) =>
                {
                    uploadedKey = key;
                    uploadedContentType = contentType;
                }
            )
            .Returns(Task.CompletedTask);

        Photo? persisted = null;
        _repoMock
            .Setup(r => r.CreateAsync(It.IsAny<Photo>(), It.IsAny<CancellationToken>()))
            .Callback<Photo, CancellationToken>((photo, _) => persisted = photo)
            .Returns(Task.CompletedTask);

        Guid photoId = await _handler.Handle(command, CancellationToken.None);

        photoId.Should().NotBe(Guid.Empty);

        uploadedKey.Should().Be($"breweries/some-brewery-id/{photoId}");
        uploadedContentType.Should().Be("image/png");

        persisted.Should().NotBeNull();
        persisted!.Hyperlink.Should().Be(uploadedKey);
        persisted.UploadedById.Should().Be(command.UploadedById);

        _fileStorageProviderMock.Verify(
            p =>
                p.UploadAsync(
                    uploadedKey!,
                    It.IsAny<Stream>(),
                    "image/png",
                    It.IsAny<CancellationToken>()
                ),
            Times.Once
        );
        _repoMock.Verify(
            r => r.CreateAsync(It.IsAny<Photo>(), It.IsAny<CancellationToken>()),
            Times.Once
        );
    }

    [Fact]
    public async Task Handle_UploadOrderedBeforePersist_DoesNotPersistWhenUploadFails()
    {
        Mock<IFormFile> file = ValidFile();
        UploadPhotoCommand command = new(Guid.NewGuid(), "avatars", file.Object);

        _fileStorageProviderMock
            .Setup(p =>
                p.UploadAsync(
                    It.IsAny<string>(),
                    It.IsAny<Stream>(),
                    It.IsAny<string>(),
                    It.IsAny<CancellationToken>()
                )
            )
            .ThrowsAsync(new InvalidOperationException("storage unavailable"));

        Func<Task> act = () => _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>();
        _repoMock.Verify(
            r => r.CreateAsync(It.IsAny<Photo>(), It.IsAny<CancellationToken>()),
            Times.Never
        );
    }
}
