using Features.Users.Commands.Account.UpdatePassword;
using FluentValidation.TestHelper;

namespace Features.Users.Tests.Commands;

public class UpdatePasswordValidatorTests
{
    private readonly UpdatePasswordValidator _validator = new();

    private static UpdatePasswordCommand ValidCommand() =>
        new(Guid.NewGuid(), "OldPass1!", "NewPass2@");

    [Fact]
    public void Validate_ValidCommand_HasNoValidationErrors()
    {
        TestValidationResult<UpdatePasswordCommand> result = _validator.TestValidate(
            ValidCommand()
        );

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_EmptyCurrentPassword_HasErrorForCurrentPassword()
    {
        UpdatePasswordCommand command = ValidCommand() with { CurrentPassword = "" };

        TestValidationResult<UpdatePasswordCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.CurrentPassword)
            .WithErrorMessage("Current password is required");
    }

    [Fact]
    public void Validate_EmptyNewPassword_HasErrorForNewPassword()
    {
        UpdatePasswordCommand command = ValidCommand() with { NewPassword = "" };

        TestValidationResult<UpdatePasswordCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.NewPassword)
            .WithErrorMessage("New password is required");
    }

    [Fact]
    public void Validate_NewPasswordTooShort_HasErrorForNewPassword()
    {
        UpdatePasswordCommand command = ValidCommand() with { NewPassword = "Ax1!23" };

        TestValidationResult<UpdatePasswordCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.NewPassword)
            .WithErrorMessage("Password must be at least 8 characters");
    }

    [Fact]
    public void Validate_NewPasswordMissingUppercase_HasErrorForNewPassword()
    {
        UpdatePasswordCommand command = ValidCommand() with { NewPassword = "newpass1!" };

        TestValidationResult<UpdatePasswordCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.NewPassword)
            .WithErrorMessage("Password must contain at least one uppercase letter");
    }

    [Fact]
    public void Validate_NewPasswordMissingLowercase_HasErrorForNewPassword()
    {
        UpdatePasswordCommand command = ValidCommand() with { NewPassword = "NEWPASS1!" };

        TestValidationResult<UpdatePasswordCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.NewPassword)
            .WithErrorMessage("Password must contain at least one lowercase letter");
    }

    [Fact]
    public void Validate_NewPasswordMissingNumber_HasErrorForNewPassword()
    {
        UpdatePasswordCommand command = ValidCommand() with { NewPassword = "NewPassword!" };

        TestValidationResult<UpdatePasswordCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.NewPassword)
            .WithErrorMessage("Password must contain at least one number");
    }

    [Fact]
    public void Validate_NewPasswordMissingSpecialCharacter_HasErrorForNewPassword()
    {
        UpdatePasswordCommand command = ValidCommand() with { NewPassword = "NewPassword1" };

        TestValidationResult<UpdatePasswordCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.NewPassword)
            .WithErrorMessage("Password must contain at least one special character");
    }

    [Fact]
    public void Validate_NewPasswordSameAsCurrentPassword_HasErrorForNewPassword()
    {
        UpdatePasswordCommand command = ValidCommand() with
        {
            CurrentPassword = "SamePass1!",
            NewPassword = "SamePass1!"
        };

        TestValidationResult<UpdatePasswordCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.NewPassword)
            .WithErrorMessage("New password must be different from the current password");
    }
}
