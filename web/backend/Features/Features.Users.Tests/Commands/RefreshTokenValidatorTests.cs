using Features.Users.Commands.Authentication.RefreshToken;
using FluentValidation.TestHelper;

namespace Features.Users.Tests.Commands;

public class RefreshTokenValidatorTests
{
    private readonly RefreshTokenValidator _validator = new();

    private static RefreshTokenCommand ValidCommand() => new("a-valid-refresh-token");

    [Fact]
    public void Validate_ValidCommand_HasNoValidationErrors()
    {
        TestValidationResult<RefreshTokenCommand> result = _validator.TestValidate(ValidCommand());

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void Validate_EmptyRefreshToken_HasErrorForRefreshToken()
    {
        RefreshTokenCommand command = ValidCommand() with { RefreshToken = "" };

        TestValidationResult<RefreshTokenCommand> result = _validator.TestValidate(command);

        result
            .ShouldHaveValidationErrorFor(x => x.RefreshToken)
            .WithErrorMessage("Refresh token is required");
    }
}
