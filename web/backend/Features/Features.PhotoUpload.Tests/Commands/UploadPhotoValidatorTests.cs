using Features.ImageUploads.Commands.UploadPhoto;
using FluentAssertions;
using FluentValidation.Results;
using Microsoft.AspNetCore.Http;
using Moq;

namespace Features.PhotoUpload.Tests.Commands;

public class UploadPhotoValidatorTests
{
    private static readonly byte[] PngSignature =
    [
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
    ];

    private static readonly byte[] JpegSignature =
    [
        0xFF, 0xD8, 0xFF
    ];

    private static readonly byte[] WebPSignature =
    [
        0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50 // "RIFF____WEBP"
    ];

    private static readonly byte[] GifSignature =
    [
        0x47, 0x49, 0x46, 0x38, 0x39, 0x61 // "GIF89a"
    ];

    private static readonly byte[] BmpSignature =
    [
        0x42, 0x4D // "BM"
    ];

    private static readonly byte[] PdfSignature =
    [
        0x25, 0x50, 0x44, 0x46 // "%PDF"
    ];

    private static readonly byte[] PlainTextBytes = "not an image"u8.ToArray();

    private const long MinSizeBytes = 1024; // 1 KiB
    private const long MaxSizeBytes = 24 * 1024 * 1024; // 24 MiB

    private readonly UploadPhotoValidator _validator = new();

    private static Mock<IFormFile> FileOfSize(long sizeInBytes)
    {
        byte[] bytes = new byte[Math.Max(sizeInBytes, PngSignature.Length)];
        PngSignature.CopyTo(bytes, 0);

        Mock<IFormFile> file = new();
        file.Setup(f => f.OpenReadStream()).Returns(() => new MemoryStream(bytes));
        file.Setup(f => f.ContentType).Returns("image/png");
        file.Setup(f => f.Length).Returns(sizeInBytes);
        return file;
    }

    private static Mock<IFormFile> FileWithHeader(byte[] header, long sizeInBytes = 0)
    {
        byte[] bytes = new byte[Math.Max(sizeInBytes, Math.Max(header.Length, MinSizeBytes))];
        header.CopyTo(bytes, 0);

        Mock<IFormFile> file = new();
        file.Setup(f => f.OpenReadStream()).Returns(() => new MemoryStream(bytes));
        file.Setup(f => f.ContentType).Returns("image/png");
        file.Setup(f => f.Length).Returns(bytes.Length);
        return file;
    }

    private static UploadPhotoCommand CommandWithFile(IFormFile file) =>
        new(Guid.NewGuid(), "breweries/some-brewery-id", file);

    public static TheoryData<string, byte[]> ValidSignatures => new()
    {
        { "PNG", PngSignature },
        { "JPEG", JpegSignature },
        { "WebP", WebPSignature }
    };

    public static TheoryData<string, byte[]> InvalidSignatures => new()
    {
        { "GIF", GifSignature },
        { "BMP", BmpSignature },
        { "PDF", PdfSignature },
        { "plain text", PlainTextBytes }
    };

    [Fact]
    public async Task Validate_FileBelowMinSize_FailsWithSizeError()
    {
        Mock<IFormFile> file = FileOfSize(MinSizeBytes - 1);

        ValidationResult result = await _validator.ValidateAsync(CommandWithFile(file.Object));

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "File.Length");
    }

    [Fact]
    public async Task Validate_FileAtMinSize_PassesSizeCheck()
    {
        Mock<IFormFile> file = FileOfSize(MinSizeBytes);

        ValidationResult result = await _validator.ValidateAsync(CommandWithFile(file.Object));

        result.Errors.Should().NotContain(e => e.PropertyName == "File.Length");
    }

    [Fact]
    public async Task Validate_FileAtMaxSize_PassesSizeCheck()
    {
        Mock<IFormFile> file = FileOfSize(MaxSizeBytes);

        ValidationResult result = await _validator.ValidateAsync(CommandWithFile(file.Object));

        result.Errors.Should().NotContain(e => e.PropertyName == "File.Length");
    }

    [Fact]
    public async Task Validate_FileAboveMaxSize_FailsWithSizeError()
    {
        Mock<IFormFile> file = FileOfSize(MaxSizeBytes + 1);

        ValidationResult result = await _validator.ValidateAsync(CommandWithFile(file.Object));

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "File.Length");
    }

    [Theory]
    [MemberData(nameof(ValidSignatures))]
    public async Task Validate_ValidImageSignature_PassesSignatureCheck(string formatName, byte[] header)
    {
        Mock<IFormFile> file = FileWithHeader(header);

        ValidationResult result = await _validator.ValidateAsync(CommandWithFile(file.Object));

        result.Errors.Should().NotContain(e => e.PropertyName == "File", formatName);
    }

    [Theory]
    [MemberData(nameof(InvalidSignatures))]
    public async Task Validate_InvalidImageSignature_FailsWithSignatureError(string formatName, byte[] header)
    {
        Mock<IFormFile> file = FileWithHeader(header);

        ValidationResult result = await _validator.ValidateAsync(CommandWithFile(file.Object));

        result.IsValid.Should().BeFalse(formatName);
        result.Errors.Should().Contain(e => e.PropertyName == "File", formatName);
    }
}
