using FluentValidation;

namespace Features.Breweries.Commands.UpdateBrewery;

/// <summary>Validates <see cref="UpdateBreweryCommand" />.</summary>
public class UpdateBreweryValidator : AbstractValidator<UpdateBreweryCommand>
{
    public UpdateBreweryValidator()
    {
        RuleFor(x => x.RowVersion)
            .NotEmpty()
            .WithMessage("RowVersion is required to detect conflicting concurrent updates.");
    }
}
