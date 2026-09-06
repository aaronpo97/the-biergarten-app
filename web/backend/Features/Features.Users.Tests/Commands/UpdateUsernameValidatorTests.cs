using Features.Users.Commands.Account.UpdateUsername;
using FluentValidation.TestHelper;

namespace Features.Users.Tests.Commands;

public class UpdateUsernameValidatorTests
{
    private readonly UpdateUsernameValidator _validator = new();

    private static UpdateUsernameCommand ValidCommand() => new(Guid.NewGuid(), "valid.user-99");

    [Fact]
    public void Validate_ValidCommand_HasNoValidationErrors()
    {
        TestValidationResult<UpdateUsernameCommand> result = _validator.TestValidate(
            ValidCommand()
        );

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_EmptyNewUsername_HasErrorForNewUsername()
    {
        UpdateUsernameCommand command = ValidCommand() with { NewUsername = "" };

        TestValidationResult<UpdateUsernameCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.NewUsername)
            .WithErrorMessage("Username is required");
    }

    [Fact]
    public void Validate_NewUsernameTooShort_HasErrorForNewUsername()
    {
        UpdateUsernameCommand command = ValidCommand() with { NewUsername = "ab" };

        TestValidationResult<UpdateUsernameCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.NewUsername)
            .WithErrorMessage("Username must be between 3 and 64 characters");
    }

    [Fact]
    public void Validate_NewUsernameTooLong_HasErrorForNewUsername()
    {
        UpdateUsernameCommand command = ValidCommand() with { NewUsername = new string('a', 65) };

        TestValidationResult<UpdateUsernameCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.NewUsername)
            .WithErrorMessage("Username must be between 3 and 64 characters");
    }

    [Fact]
    public void Validate_NewUsernameHasDisallowedCharacters_HasErrorForNewUsername()
    {
        UpdateUsernameCommand command = ValidCommand() with { NewUsername = "bad user!" };

        TestValidationResult<UpdateUsernameCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.NewUsername)
            .WithErrorMessage(
                "Username can only contain letters, numbers, dots, underscores, and hyphens"
            );
    }
}
