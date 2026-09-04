using Features.Locations.Dtos;
using MediatR;

namespace Features.Locations.Queries.GetCityById;

public record GetCityByIdQuery(Guid CityId) : IRequest<CityDto?>;
