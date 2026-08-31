using FluentValidation;

namespace Features.Auth.Commands.Profile.UpdateProfile;

/// <summary>Validates <see cref="UpdateProfileCommand" />, mirroring the profile rules in <c>RegisterUserValidator</c>.</summary>
public class UpdateProfileValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileValidator()
    {
        RuleFor(x => x.FirstName)
            .NotEmpty()
            .WithMessage("First name is required")
            .MaximumLength(128)
            .WithMessage("First name cannot exceed 128 characters");

        RuleFor(x => x.LastName)
            .NotEmpty()
            .WithMessage("Last name is required")
            .MaximumLength(128)
            .WithMessage("Last name cannot exceed 128 characters");

        RuleFor(x => x.DateOfBirth)
            .NotEmpty()
            .WithMessage("Date of birth is required")
            .LessThan(DateTime.Today.AddYears(-19))
            .WithMessage("You must be at least 19 years old");
    }
}
