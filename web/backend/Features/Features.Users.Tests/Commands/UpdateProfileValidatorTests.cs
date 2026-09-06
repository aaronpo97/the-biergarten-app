using Features.Users.Commands.Profile.UpdateProfile;
using FluentValidation.TestHelper;

namespace Features.Users.Tests.Commands;

public class UpdateProfileValidatorTests
{
    private readonly UpdateProfileValidator _validator = new();

    private static UpdateProfileCommand ValidCommand() =>
        new(Guid.NewGuid(), "John", "Doe", DateTime.Today.AddYears(-25));

    [Fact]
    public void Validate_ValidCommand_HasNoValidationErrors()
    {
        TestValidationResult<UpdateProfileCommand> result = _validator.TestValidate(
            ValidCommand()
        );

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_EmptyFirstName_HasErrorForFirstName()
    {
        UpdateProfileCommand command = ValidCommand() with { FirstName = "" };

        TestValidationResult<UpdateProfileCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.FirstName)
            .WithErrorMessage("First name is required");
    }

    [Fact]
    public void Validate_FirstNameTooLong_HasErrorForFirstName()
    {
        UpdateProfileCommand command = ValidCommand() with { FirstName = new string('a', 129) };

        TestValidationResult<UpdateProfileCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.FirstName)
            .WithErrorMessage("First name cannot exceed 128 characters");
    }

    [Fact]
    public void Validate_EmptyLastName_HasErrorForLastName()
    {
        UpdateProfileCommand command = ValidCommand() with { LastName = "" };

        TestValidationResult<UpdateProfileCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.LastName)
            .WithErrorMessage("Last name is required");
    }

    [Fact]
    public void Validate_LastNameTooLong_HasErrorForLastName()
    {
        UpdateProfileCommand command = ValidCommand() with { LastName = new string('a', 129) };

        TestValidationResult<UpdateProfileCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.LastName)
            .WithErrorMessage("Last name cannot exceed 128 characters");
    }

    [Fact]
    public void Validate_DefaultDateOfBirth_HasErrorForDateOfBirth()
    {
        UpdateProfileCommand command = ValidCommand() with { DateOfBirth = default };

        TestValidationResult<UpdateProfileCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.DateOfBirth)
            .WithErrorMessage("Date of birth is required");
    }

    [Fact]
    public void Validate_DateOfBirthExactlyNineteenYearsAgo_HasErrorForDateOfBirth()
    {
        UpdateProfileCommand command = ValidCommand() with
        {
            DateOfBirth = DateTime.Today.AddYears(-19)
        };

        TestValidationResult<UpdateProfileCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.DateOfBirth)
            .WithErrorMessage("You must be at least 19 years old");
    }
}
