using FluentValidation;

namespace Features.Auth.Commands.UpdateEmail;

/// <summary>Validates <see cref="UpdateEmailCommand" />, mirroring the email rules in <c>RegisterUserValidator</c>.</summary>
public class UpdateEmailValidator : AbstractValidator<UpdateEmailCommand>
{
    public UpdateEmailValidator()
    {
        RuleFor(x => x.NewEmail)
            .NotEmpty()
            .WithMessage("Email is required")
            .EmailAddress()
            .WithMessage("Invalid email format")
            .MaximumLength(128)
            .WithMessage("Email cannot exceed 128 characters");
    }
}
