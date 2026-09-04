using Features.Locations.Repository;
using MediatR;

namespace Features.Locations.Queries.GetStateProvince;

public class GetStateProvinceHandler(ILocationRepository repository)
    : IRequestHandler<GetStateProvinceQuery, Guid?>
{
    public Task<Guid?> Handle(GetStateProvinceQuery request, CancellationToken cancellationToken) =>
        repository.GetStateProvinceIdAsync(request.IsoCode);
}
