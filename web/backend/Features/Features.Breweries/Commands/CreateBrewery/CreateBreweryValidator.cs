using FluentValidation;

namespace Features.Breweries.Commands.CreateBrewery;

/// <summary>
/// Validates <see cref="CreateBreweryCommand"/> instances before they are processed.
/// </summary>
public class CreateBreweryValidator : AbstractValidator<CreateBreweryCommand>
{
    /// <summary>
    /// Configures validation rules requiring <see cref="CreateBreweryCommand.PostedById"/>,
    /// <see cref="CreateBreweryCommand.BreweryName"/>, <see cref="CreateBreweryCommand.Description"/>, and
    /// <see cref="CreateBreweryCommand.Location"/> to be present, with length limits on the name, description,
    /// address line 1, and postal code fields.
    /// </summary>
    public CreateBreweryValidator()
    {
        RuleFor(x => x.PostedById)
            .NotEmpty()
            .WithMessage("PostedById is required.");

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

        RuleFor(x => x.Location)
            .NotNull()
            .WithMessage("Location is required.");

        RuleFor(x => x.Location.CityId)
            .NotEmpty()
            .When(x => x.Location is not null)
            .WithMessage("CityId is required.");

        RuleFor(x => x.Location.AddressLine1)
            .NotEmpty()
            .When(x => x.Location is not null)
            .WithMessage("Address line 1 is required.")
            .MaximumLength(256)
            .When(x => x.Location is not null)
            .WithMessage("Address line 1 cannot exceed 256 characters.");

        RuleFor(x => x.Location.PostalCode)
            .NotEmpty()
            .When(x => x.Location is not null)
            .WithMessage("Postal code is required.")
            .MaximumLength(20)
            .When(x => x.Location is not null)
            .WithMessage("Postal code cannot exceed 20 characters.");
    }
}
