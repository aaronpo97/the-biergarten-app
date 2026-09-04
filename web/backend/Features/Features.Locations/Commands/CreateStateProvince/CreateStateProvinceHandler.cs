using Features.Locations.Repository;
using MediatR;

namespace Features.Locations.Commands.CreateStateProvince;

public class CreateStateProvinceHandler(ILocationRepository repository)
    : IRequestHandler<CreateStateProvinceCommand, Guid>
{
    public Task<Guid> Handle(
        CreateStateProvinceCommand request,
        CancellationToken cancellationToken
    ) =>
        repository.CreateStateProvinceAsync(
            request.StateProvinceName,
            request.IsoCode,
            request.CountryId
        );
}
