using FluentValidation;

namespace Features.Auth.Commands.UpdateUsername;

/// <summary>Validates <see cref="UpdateUsernameCommand" />, mirroring the username rules in <c>RegisterUserValidator</c>.</summary>
public class UpdateUsernameValidator : AbstractValidator<UpdateUsernameCommand>
{
    public UpdateUsernameValidator()
    {
        RuleFor(x => x.NewUsername)
            .NotEmpty()
            .WithMessage("Username is required")
            .Length(3, 64)
            .WithMessage("Username must be between 3 and 64 characters")
            .Matches("^[a-zA-Z0-9._-]+$")
            .WithMessage(
                "Username can only contain letters, numbers, dots, underscores, and hyphens"
            );
    }
}
