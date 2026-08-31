using FluentValidation;

namespace Features.Auth.Commands.Account.UpdatePassword;

/// <summary>Validates <see cref="UpdatePasswordCommand" />, mirroring the password rules in <c>RegisterUserValidator</c>.</summary>
public class UpdatePasswordValidator : AbstractValidator<UpdatePasswordCommand>
{
    public UpdatePasswordValidator()
    {
        RuleFor(x => x.CurrentPassword).NotEmpty().WithMessage("Current password is required");

        RuleFor(x => x.NewPassword)
            .NotEmpty()
            .WithMessage("New password is required")
            .MinimumLength(8)
            .WithMessage("Password must be at least 8 characters")
            .Matches("[A-Z]")
            .WithMessage("Password must contain at least one uppercase letter")
            .Matches("[a-z]")
            .WithMessage("Password must contain at least one lowercase letter")
            .Matches("[0-9]")
            .WithMessage("Password must contain at least one number")
            .Matches("[^a-zA-Z0-9]")
            .WithMessage("Password must contain at least one special character")
            .NotEqual(x => x.CurrentPassword)
            .WithMessage("New password must be different from the current password");
    }
}
