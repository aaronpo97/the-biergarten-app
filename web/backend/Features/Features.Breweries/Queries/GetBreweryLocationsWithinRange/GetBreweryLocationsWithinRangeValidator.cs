using FluentValidation;

namespace Features.Breweries.Queries.GetBreweryLocationsWithinRange;

/// <summary>
///     Validates coordinates and radius values for proximity searches.
/// </summary>
public class GetBreweryLocationsWithinRangeValidator
    : AbstractValidator<GetBreweryLocationsWithinRangeQuery>
{
    public GetBreweryLocationsWithinRangeValidator()
    {
        RuleFor(x => x.Latitude)
            .InclusiveBetween(-90, 90)
            .WithMessage("Latitude must be between -90 and 90 degrees.");

        RuleFor(x => x.Longitude)
            .InclusiveBetween(-180, 180)
            .WithMessage("Longitude must be between -180 and 180 degrees.");

        RuleFor(x => x.RangeInMetres)
            .GreaterThan(0)
            .WithMessage("RangeInMetres must be greater than zero.");
    }
}
