using Features.Locations.Dtos;
using Features.Locations.Repository;
using MediatR;

namespace Features.Locations.Queries.GetAllCities;

public class GetAllCitiesHandler(ILocationRepository repository)
    : IRequestHandler<GetAllCitiesQuery, IEnumerable<CityDto>>
{
    public Task<IEnumerable<CityDto>> Handle(
        GetAllCitiesQuery request,
        CancellationToken cancellationToken
    ) => repository.GetAllCitiesAsync(request.Limit, request.Offset);
}
