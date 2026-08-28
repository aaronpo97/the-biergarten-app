using FluentValidation;

namespace Features.ImageUploads.Commands.UploadPhoto;

/// <summary>Validates <see cref="UploadPhotoCommand" />.</summary>
public class UploadPhotoValidator : AbstractValidator<UploadPhotoCommand>
{
    public UploadPhotoValidator()
    {
        RuleFor(x => x.UploadedById)
            .NotEmpty()
            .WithMessage("UploadedById is required.");

        RuleFor(x => x.File)
            .NotNull()
            .WithMessage("File is required.");

        RuleFor(x => x.Key)
            .NotEmpty()
            .WithMessage("Key is required.");


        RuleFor(x => x.File.Length)
            .GreaterThan(0)
            .When(x => x.File is not null)
            .WithMessage("File cannot be empty.");

        RuleFor(x => x.File.ContentType)
            .Must(contentType => contentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
            .When(x => x.File is not null)
            .WithMessage("File must be an image.");
    }
}
