using MediatR;

namespace Features.Locations.Queries.GetCity;

public record GetCityQuery(string CityName, string StateProvinceIsoCode) : IRequest<Guid?>;
