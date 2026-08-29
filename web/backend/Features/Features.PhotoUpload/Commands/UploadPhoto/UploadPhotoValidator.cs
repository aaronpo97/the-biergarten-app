using FluentValidation;
using Microsoft.AspNetCore.Http;

namespace Features.ImageUploads.Commands.UploadPhoto;

/// <summary>Validates <see cref="UploadPhotoCommand" />.</summary>
public class UploadPhotoValidator : AbstractValidator<UploadPhotoCommand>
{
    private static readonly byte[] PngSignature =
    [
        0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
    ];

    private static readonly byte[] JpegSignature =
    [
        0xFF, 0xD8, 0xFF
    ];

    private static readonly byte[] RiffSignature =
    [
        0x52, 0x49, 0x46, 0x46 // "RIFF"
    ];

    private static readonly byte[] WebPMarker =
    [
        0x57, 0x45, 0x42, 0x50 // "WEBP"
    ];

    private const long MaxFileSizeInBytes = 0x100000 * 20; // 20 MB

    public UploadPhotoValidator()
    {
        RuleFor(x => x.UploadedById).NotEmpty().WithMessage("UploadedById is required.");

        RuleFor(x => x.File).NotNull().WithMessage("File is required.");

        RuleFor(x => x.Key).NotEmpty().WithMessage("Key is required.");

        RuleFor(x => x.File.ContentType)
            .Must(contentType => contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            .WithMessage("File must be an image.");

        // RuleFor(x => x.File.Length)
        //     .InclusiveBetween(1, MaxFileSizeInBytes)
        //     .WithMessage($"The file must be between 1 byte and {FileSizeConverter.MiBToMB(MaxFileSizeInBytes  )} MB.");

        RuleFor(x => x.File)
            .MustAsync(HaveValidImageSignatureAsync)
            .WithMessage("The file is not a valid PNG, JPEG, or WebP image.");
    }

    private static async Task<bool> HaveValidImageSignatureAsync(IFormFile file, CancellationToken cancellationToken)
    {
        var buffer = new byte[12];
        await using var stream = file.OpenReadStream();
        var bytesRead = await stream.ReadAsync(buffer.AsMemory(0, buffer.Length), cancellationToken);

        return IsPng(buffer, bytesRead) || IsJpeg(buffer, bytesRead) || IsWebP(buffer, bytesRead);
    }

    private static bool IsPng(byte[] buffer, int bytesRead) =>
        bytesRead >= PngSignature.Length && buffer.AsSpan(0, PngSignature.Length).SequenceEqual(PngSignature);

    private static bool IsJpeg(byte[] buffer, int bytesRead) =>
        bytesRead >= JpegSignature.Length && buffer.AsSpan(0, JpegSignature.Length).SequenceEqual(JpegSignature);

    private static bool IsWebP(byte[] buffer, int bytesRead) =>
        bytesRead >= 12
        && buffer.AsSpan(0, 4).SequenceEqual(RiffSignature)
        && buffer.AsSpan(8, 4).SequenceEqual(WebPMarker);
}