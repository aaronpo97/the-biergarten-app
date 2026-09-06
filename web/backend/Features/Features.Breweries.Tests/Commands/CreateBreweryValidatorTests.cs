using Features.Breweries.Commands.CreateBrewery;
using FluentValidation.TestHelper;

namespace Features.Breweries.Tests.Commands;

public class CreateBreweryValidatorTests
{
    private readonly CreateBreweryValidator _validator = new();

    private static CreateBreweryLocation ValidLocation() =>
        new(Guid.NewGuid(), "123 Main St", null, "12345", null);

    private static CreateBreweryCommand ValidCommand() =>
        new(Guid.NewGuid(), "Valid Brewery", "A valid description.", ValidLocation());

    [Fact]
    public void Validate_ValidCommand_HasNoValidationErrors()
    {
        TestValidationResult<CreateBreweryCommand> result = _validator.TestValidate(ValidCommand());

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_EmptyPostedById_HasErrorForPostedById()
    {
        CreateBreweryCommand command = ValidCommand() with { PostedById = Guid.Empty };

        TestValidationResult<CreateBreweryCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.PostedById)
            .WithErrorMessage("PostedById is required.");
    }

    [Fact]
    public void Validate_EmptyBreweryName_HasErrorForBreweryName()
    {
        CreateBreweryCommand command = ValidCommand() with { BreweryName = "" };

        TestValidationResult<CreateBreweryCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.BreweryName)
            .WithErrorMessage("Brewery name is required.");
    }

    [Fact]
    public void Validate_BreweryNameTooLong_HasErrorForBreweryName()
    {
        CreateBreweryCommand command = ValidCommand() with { BreweryName = new string('a', 257) };

        TestValidationResult<CreateBreweryCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.BreweryName)
            .WithErrorMessage("Brewery name cannot exceed 256 characters.");
    }

    [Fact]
    public void Validate_EmptyDescription_HasErrorForDescription()
    {
        CreateBreweryCommand command = ValidCommand() with { Description = "" };

        TestValidationResult<CreateBreweryCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.Description)
            .WithErrorMessage("Description is required.");
    }

    [Fact]
    public void Validate_DescriptionTooLong_HasErrorForDescription()
    {
        CreateBreweryCommand command = ValidCommand() with { Description = new string('a', 513) };

        TestValidationResult<CreateBreweryCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.Description)
            .WithErrorMessage("Description cannot exceed 512 characters.");
    }

    [Fact]
    public void Validate_NullLocation_HasErrorForLocationOnly()
    {
        CreateBreweryCommand command = ValidCommand() with { Location = null! };

        TestValidationResult<CreateBreweryCommand> result = _validator.TestValidate(command);

        result.ShouldHaveValidationErrorFor(x => x.Location).WithErrorMessage("Location is required.");
        result.ShouldNotHaveValidationErrorFor("Location.CityId");
        result.ShouldNotHaveValidationErrorFor("Location.AddressLine1");
        result.ShouldNotHaveValidationErrorFor("Location.PostalCode");
    }

    [Fact]
    public void Validate_EmptyCityId_HasErrorForCityId()
    {
        CreateBreweryCommand command = ValidCommand() with
        {
            Location = ValidLocation() with { CityId = Guid.Empty }
        };

        TestValidationResult<CreateBreweryCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.Location.CityId)
            .WithErrorMessage("CityId is required.");
    }

    [Fact]
    public void Validate_EmptyAddressLine1_HasErrorForAddressLine1()
    {
        CreateBreweryCommand command = ValidCommand() with
        {
            Location = ValidLocation() with { AddressLine1 = "" }
        };

        TestValidationResult<CreateBreweryCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.Location.AddressLine1)
            .WithErrorMessage("Address line 1 is required.");
    }

    [Fact]
    public void Validate_AddressLine1TooLong_HasErrorForAddressLine1()
    {
        CreateBreweryCommand command = ValidCommand() with
        {
            Location = ValidLocation() with { AddressLine1 = new string('a', 257) }
        };

        TestValidationResult<CreateBreweryCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.Location.AddressLine1)
            .WithErrorMessage("Address line 1 cannot exceed 256 characters.");
    }

    [Fact]
    public void Validate_EmptyPostalCode_HasErrorForPostalCode()
    {
        CreateBreweryCommand command = ValidCommand() with
        {
            Location = ValidLocation() with { PostalCode = "" }
        };

        TestValidationResult<CreateBreweryCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.Location.PostalCode)
            .WithErrorMessage("Postal code is required.");
    }

    [Fact]
    public void Validate_PostalCodeTooLong_HasErrorForPostalCode()
    {
        CreateBreweryCommand command = ValidCommand() with
        {
            Location = ValidLocation() with { PostalCode = new string('1', 21) }
        };

        TestValidationResult<CreateBreweryCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.Location.PostalCode)
            .WithErrorMessage("Postal code cannot exceed 20 characters.");
    }
}
