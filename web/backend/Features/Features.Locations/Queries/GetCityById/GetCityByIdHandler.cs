using Features.Locations.Dtos;
using Features.Locations.Repository;
using MediatR;

namespace Features.Locations.Queries.GetCityById;

public class GetCityByIdHandler(ILocationRepository repository)
    : IRequestHandler<GetCityByIdQuery, CityDto?>
{
    public Task<CityDto?> Handle(GetCityByIdQuery request, CancellationToken cancellationToken) =>
        repository.GetCityByIdAsync(request.CityId);
}
