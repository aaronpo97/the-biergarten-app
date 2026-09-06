using Features.Users.Commands.Authentication.RegisterUser;
using FluentValidation.TestHelper;

namespace Features.Users.Tests.Commands;

public class RegisterUserValidatorTests
{
    private readonly RegisterUserValidator _validator = new();

    private static RegisterUserCommand ValidCommand() =>
        new(
            "valid.user-99",
            "Jane",
            "Doe",
            "jane.doe@example.com",
            DateTime.Today.AddYears(-25),
            "Password1!"
        );

    [Fact]
    public void Validate_ValidCommand_HasNoValidationErrors()
    {
        TestValidationResult<RegisterUserCommand> result = _validator.TestValidate(ValidCommand());

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_EmptyUsername_HasErrorForUsername()
    {
        RegisterUserCommand command = ValidCommand() with { Username = "" };

        TestValidationResult<RegisterUserCommand> result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Username).WithErrorMessage("Username is required");
    }

    [Fact]
    public void Validate_UsernameTooShort_HasErrorForUsername()
    {
        RegisterUserCommand command = ValidCommand() with { Username = "ab" };

        TestValidationResult<RegisterUserCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.Username)
            .WithErrorMessage("Username must be between 3 and 64 characters");
    }

    [Fact]
    public void Validate_UsernameTooLong_HasErrorForUsername()
    {
        RegisterUserCommand command = ValidCommand() with { Username = new string('a', 65) };

        TestValidationResult<RegisterUserCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.Username)
            .WithErrorMessage("Username must be between 3 and 64 characters");
    }

    [Fact]
    public void Validate_UsernameHasDisallowedCharacters_HasErrorForUsername()
    {
        RegisterUserCommand command = ValidCommand() with { Username = "bad user!" };

        TestValidationResult<RegisterUserCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.Username)
            .WithErrorMessage(
                "Username can only contain letters, numbers, dots, underscores, and hyphens"
            );
    }

    [Fact]
    public void Validate_EmptyFirstName_HasErrorForFirstName()
    {
        RegisterUserCommand command = ValidCommand() with { FirstName = "" };

        TestValidationResult<RegisterUserCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.FirstName)
            .WithErrorMessage("First name is required");
    }

    [Fact]
    public void Validate_FirstNameTooLong_HasErrorForFirstName()
    {
        RegisterUserCommand command = ValidCommand() with { FirstName = new string('a', 129) };

        TestValidationResult<RegisterUserCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.FirstName)
            .WithErrorMessage("First name cannot exceed 128 characters");
    }

    [Fact]
    public void Validate_EmptyLastName_HasErrorForLastName()
    {
        RegisterUserCommand command = ValidCommand() with { LastName = "" };

        TestValidationResult<RegisterUserCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.LastName)
            .WithErrorMessage("Last name is required");
    }

    [Fact]
    public void Validate_LastNameTooLong_HasErrorForLastName()
    {
        RegisterUserCommand command = ValidCommand() with { LastName = new string('a', 129) };

        TestValidationResult<RegisterUserCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.LastName)
            .WithErrorMessage("Last name cannot exceed 128 characters");
    }

    [Fact]
    public void Validate_EmptyEmail_HasErrorForEmail()
    {
        RegisterUserCommand command = ValidCommand() with { Email = "" };

        TestValidationResult<RegisterUserCommand> result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Email).WithErrorMessage("Email is required");
    }

    [Fact]
    public void Validate_InvalidEmailFormat_HasErrorForEmail()
    {
        RegisterUserCommand command = ValidCommand() with { Email = "not-an-email" };

        TestValidationResult<RegisterUserCommand> result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Email).WithErrorMessage("Invalid email format");
    }

    [Fact]
    public void Validate_EmailTooLong_HasErrorForEmail()
    {
        string localPart = new('a', 121);
        RegisterUserCommand command = ValidCommand() with { Email = $"{localPart}@example.com" };

        TestValidationResult<RegisterUserCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.Email)
            .WithErrorMessage("Email cannot exceed 128 characters");
    }

    [Fact]
    public void Validate_DateOfBirthUnderMinimumAge_HasErrorForDateOfBirth()
    {
        RegisterUserCommand command = ValidCommand() with
        {
            DateOfBirth = DateTime.Today.AddYears(-18)
        };

        TestValidationResult<RegisterUserCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.DateOfBirth)
            .WithErrorMessage("You must be at least 19 years old to register");
    }

    [Fact]
    public void Validate_EmptyPassword_HasErrorForPassword()
    {
        RegisterUserCommand command = ValidCommand() with { Password = "" };

        TestValidationResult<RegisterUserCommand> result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Password).WithErrorMessage("Password is required");
    }

    [Fact]
    public void Validate_PasswordTooShort_HasErrorForPassword()
    {
        RegisterUserCommand command = ValidCommand() with { Password = "Ax1!23" };

        TestValidationResult<RegisterUserCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.Password)
            .WithErrorMessage("Password must be at least 8 characters");
    }

    [Fact]
    public void Validate_PasswordMissingUppercase_HasErrorForPassword()
    {
        RegisterUserCommand command = ValidCommand() with { Password = "password1!" };

        TestValidationResult<RegisterUserCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.Password)
            .WithErrorMessage("Password must contain at least one uppercase letter");
    }

    [Fact]
    public void Validate_PasswordMissingLowercase_HasErrorForPassword()
    {
        RegisterUserCommand command = ValidCommand() with { Password = "PASSWORD1!" };

        TestValidationResult<RegisterUserCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.Password)
            .WithErrorMessage("Password must contain at least one lowercase letter");
    }

    [Fact]
    public void Validate_PasswordMissingNumber_HasErrorForPassword()
    {
        RegisterUserCommand command = ValidCommand() with { Password = "Password!" };

        TestValidationResult<RegisterUserCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.Password)
            .WithErrorMessage("Password must contain at least one number");
    }

    [Fact]
    public void Validate_PasswordMissingSpecialCharacter_HasErrorForPassword()
    {
        RegisterUserCommand command = ValidCommand() with { Password = "Password1" };

        TestValidationResult<RegisterUserCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.Password)
            .WithErrorMessage("Password must contain at least one special character");
    }
}
