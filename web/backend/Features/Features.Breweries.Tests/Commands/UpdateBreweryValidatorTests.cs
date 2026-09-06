using Features.Breweries.Commands.UpdateBrewery;
using FluentValidation.TestHelper;

namespace Features.Breweries.Tests.Commands;

public class UpdateBreweryValidatorTests
{
    private readonly UpdateBreweryValidator _validator = new();

    private static UpdateBreweryCommand ValidCommand() =>
        new(Guid.NewGuid(), Guid.NewGuid(), [0x01, 0x02], "Name", "Description", null);

    [Fact]
    public void Validate_ValidCommand_HasNoValidationErrors()
    {
        TestValidationResult<UpdateBreweryCommand> result = _validator.TestValidate(ValidCommand());

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_EmptyRowVersion_HasErrorForRowVersion()
    {
        UpdateBreweryCommand command = ValidCommand() with { RowVersion = [] };

        TestValidationResult<UpdateBreweryCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.RowVersion)
            .WithErrorMessage("RowVersion is required to detect conflicting concurrent updates.");
    }
}
