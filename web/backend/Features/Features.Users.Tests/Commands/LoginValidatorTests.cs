using Features.Users.Commands.Authentication.Login;
using FluentValidation.TestHelper;

namespace Features.Users.Tests.Commands;

public class LoginValidatorTests
{
    private readonly LoginValidator _validator = new();

    private static LoginCommand ValidCommand() => new("valid.user-99", "Password1!");

    [Fact]
    public void Validate_ValidCommand_HasNoValidationErrors()
    {
        TestValidationResult<LoginCommand> result = _validator.TestValidate(ValidCommand());

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_EmptyUsername_HasErrorForUsername()
    {
        LoginCommand command = ValidCommand() with { Username = "" };

        TestValidationResult<LoginCommand> result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Username).WithErrorMessage("Username is required");
    }

    [Fact]
    public void Validate_EmptyPassword_HasErrorForPassword()
    {
        LoginCommand command = ValidCommand() with { Password = "" };

        TestValidationResult<LoginCommand> result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Password).WithErrorMessage("Password is required");
    }
}
