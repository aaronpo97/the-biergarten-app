using MediatR;

namespace Features.Locations.Commands.CreateCountry;

public record CreateCountryCommand(string CountryName, string IsoCode) : IRequest<Guid>;
