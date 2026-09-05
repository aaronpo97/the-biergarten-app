using Features.Locations.Dtos;
using MediatR;

namespace Features.Locations.Queries.GetAllCities;

public record GetAllCitiesQuery(int? Limit, int? Offset) : IRequest<IEnumerable<CityDto>>;
