using Features.Users.Commands.Account.UpdateEmail;
using FluentValidation.TestHelper;

namespace Features.Users.Tests.Commands;

public class UpdateEmailValidatorTests
{
    private readonly UpdateEmailValidator _validator = new();

    private static UpdateEmailCommand ValidCommand() => new(Guid.NewGuid(), "user@example.com");

    [Fact]
    public void Validate_ValidCommand_HasNoValidationErrors()
    {
        TestValidationResult<UpdateEmailCommand> result = _validator.TestValidate(ValidCommand());

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_EmptyNewEmail_HasErrorForNewEmail()
    {
        UpdateEmailCommand command = ValidCommand() with { NewEmail = "" };

        TestValidationResult<UpdateEmailCommand> result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.NewEmail).WithErrorMessage("Email is required");
    }

    [Fact]
    public void Validate_InvalidEmailFormat_HasErrorForNewEmail()
    {
        UpdateEmailCommand command = ValidCommand() with { NewEmail = "not-an-email" };

        TestValidationResult<UpdateEmailCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.NewEmail)
            .WithErrorMessage("Invalid email format");
    }

    [Fact]
    public void Validate_NewEmailTooLong_HasErrorForNewEmail()
    {
        string localPart = new('a', 120);
        UpdateEmailCommand command = ValidCommand() with { NewEmail = $"{localPart}@example.com" };

        TestValidationResult<UpdateEmailCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.NewEmail)
            .WithErrorMessage("Email cannot exceed 128 characters");
    }
}
