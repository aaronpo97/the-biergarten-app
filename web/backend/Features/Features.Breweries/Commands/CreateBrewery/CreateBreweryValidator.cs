using FluentValidation;

namespace Features.Breweries.Commands.CreateBrewery;

/// <summary>Validates <see cref="CreateBreweryCommand" />.</summary>
public class CreateBreweryValidator : AbstractValidator<CreateBreweryCommand>
{
    public CreateBreweryValidator()
    {
        RuleFor(x => x.PostedById).NotEmpty().WithMessage("PostedById is required.");

        RuleFor(x => x.BreweryName)
            .NotEmpty()
            .WithMessage("Brewery name is required.")
            .MaximumLength(256)
            .WithMessage("Brewery name cannot exceed 256 characters.");

        RuleFor(x => x.Description)
            .NotEmpty()
            .WithMessage("Description is required.")
            .MaximumLength(512)
            .WithMessage("Description cannot exceed 512 characters.");

        RuleFor(x => x.Location).NotNull().WithMessage("Location is required.");

        RuleFor(x => x.Location.CityId).NotEmpty().WithMessage("CityId is required.");

        RuleFor(x => x.Location.AddressLine1)
            .NotEmpty()
            .When(x => x.Location is not null)
            .WithMessage("Address line 1 is required.")
            .MaximumLength(256)
            .WithMessage("Address line 1 cannot exceed 256 characters.");

        RuleFor(x => x.Location.PostalCode)
            .NotEmpty()
            .WithMessage("Postal code is required.")
            .MaximumLength(20)
            .WithMessage("Postal code cannot exceed 20 characters.");
    }
}
