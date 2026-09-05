using MediatR;

namespace Features.Locations.Queries.GetCountry;

public record GetCountryQuery(string IsoCode) : IRequest<Guid?>;
