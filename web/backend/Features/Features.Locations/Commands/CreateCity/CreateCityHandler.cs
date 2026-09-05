using Features.Locations.Repository;
using MediatR;

namespace Features.Locations.Commands.CreateCity;

public class CreateCityHandler(ILocationRepository repository)
    : IRequestHandler<CreateCityCommand, Guid>
{
    public Task<Guid> Handle(CreateCityCommand request, CancellationToken cancellationToken) =>
        repository.CreateCityAsync(request.CityName, request.StateProvinceId);
}
