using Features.Breweries.Queries.GetBreweryLocationsWithinRange;
using FluentValidation.TestHelper;

namespace Features.Breweries.Tests.Queries;

public class GetBreweryLocationsWithinRangeValidatorTests
{
    private readonly GetBreweryLocationsWithinRangeValidator _validator = new();

    private static GetBreweryLocationsWithinRangeQuery ValidQuery() => new(45, -73, 1000);

    [Fact]
    public void Validate_ValidQuery_HasNoValidationErrors()
    {
        TestValidationResult<GetBreweryLocationsWithinRangeQuery> result = _validator.TestValidate(
            ValidQuery()
        );

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData(-90)]
    [InlineData(90)]
    public void Validate_LatitudeAtBoundary_HasNoValidationErrorForLatitude(double latitude)
    {
        GetBreweryLocationsWithinRangeQuery query = ValidQuery() with { Latitude = latitude };

        TestValidationResult<GetBreweryLocationsWithinRangeQuery> result = _validator.TestValidate(
            query
        );

        result.ShouldNotHaveValidationErrorFor(x => x.Latitude);
    }

    [Theory]
    [InlineData(90.0001)]
    [InlineData(-90.0001)]
    public void Validate_LatitudeOutOfRange_HasErrorForLatitude(double latitude)
    {
        GetBreweryLocationsWithinRangeQuery query = ValidQuery() with { Latitude = latitude };

        TestValidationResult<GetBreweryLocationsWithinRangeQuery> result = _validator.TestValidate(
            query
        );

        result
            .ShouldHaveValidationErrorFor(x => x.Latitude)
            .WithErrorMessage("Latitude must be between -90 and 90 degrees.");
    }

    [Theory]
    [InlineData(-180)]
    [InlineData(180)]
    public void Validate_LongitudeAtBoundary_HasNoValidationErrorForLongitude(double longitude)
    {
        GetBreweryLocationsWithinRangeQuery query = ValidQuery() with { Longitude = longitude };

        TestValidationResult<GetBreweryLocationsWithinRangeQuery> result = _validator.TestValidate(
            query
        );

        result.ShouldNotHaveValidationErrorFor(x => x.Longitude);
    }

    [Theory]
    [InlineData(180.0001)]
    [InlineData(-180.0001)]
    public void Validate_LongitudeOutOfRange_HasErrorForLongitude(double longitude)
    {
        GetBreweryLocationsWithinRangeQuery query = ValidQuery() with { Longitude = longitude };

        TestValidationResult<GetBreweryLocationsWithinRangeQuery> result = _validator.TestValidate(
            query
        );

        result
            .ShouldHaveValidationErrorFor(x => x.Longitude)
            .WithErrorMessage("Longitude must be between -180 and 180 degrees.");
    }

    [Fact]
    public void Validate_RangeInMetresIsZero_HasErrorForRangeInMetres()
    {
        GetBreweryLocationsWithinRangeQuery query = ValidQuery() with { RangeInMetres = 0 };

        TestValidationResult<GetBreweryLocationsWithinRangeQuery> result = _validator.TestValidate(
            query
        );

        result
            .ShouldHaveValidationErrorFor(x => x.RangeInMetres)
            .WithErrorMessage("RangeInMetres must be greater than zero.");
    }

    [Fact]
    public void Validate_RangeInMetresIsNegative_HasErrorForRangeInMetres()
    {
        GetBreweryLocationsWithinRangeQuery query = ValidQuery() with { RangeInMetres = -1 };

        TestValidationResult<GetBreweryLocationsWithinRangeQuery> result = _validator.TestValidate(
            query
        );

        result
            .ShouldHaveValidationErrorFor(x => x.RangeInMetres)
            .WithErrorMessage("RangeInMetres must be greater than zero.");
    }
}
