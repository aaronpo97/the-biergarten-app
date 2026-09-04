using Features.Locations.Repository;
using MediatR;

namespace Features.Locations.Queries.GetCity;

public class GetCityHandler(ILocationRepository repository) : IRequestHandler<GetCityQuery, Guid?>
{
    public Task<Guid?> Handle(GetCityQuery request, CancellationToken cancellationToken) =>
        repository.GetCityIdAsync(request.CityName, request.StateProvinceIsoCode);
}
