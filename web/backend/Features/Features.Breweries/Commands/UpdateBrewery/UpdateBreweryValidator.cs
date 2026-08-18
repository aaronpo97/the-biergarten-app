using FluentValidation;

namespace Features.Breweries.Commands.UpdateBrewery;

/// <summary>Validates <see cref="UpdateBreweryCommand" />.</summary>
public class UpdateBreweryValidator : AbstractValidator<UpdateBreweryCommand>
{
    public UpdateBreweryValidator()
    {
        RuleFor(x => x.Timer)
            .NotEmpty()
            .WithMessage("Timer is required to detect conflicting concurrent updates.");
    }
}
