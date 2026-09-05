using Features.Locations.Repository;
using MediatR;

namespace Features.Locations.Queries.GetCountry;

public class GetCountryHandler(ILocationRepository repository)
    : IRequestHandler<GetCountryQuery, Guid?>
{
    public Task<Guid?> Handle(GetCountryQuery request, CancellationToken cancellationToken) =>
        repository.GetCountryIdAsync(request.IsoCode);
}
