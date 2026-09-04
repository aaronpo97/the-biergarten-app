using Features.Locations.Repository;
using MediatR;

namespace Features.Locations.Commands.CreateCountry;

public class CreateCountryHandler(ILocationRepository repository)
    : IRequestHandler<CreateCountryCommand, Guid>
{
    public Task<Guid> Handle(CreateCountryCommand request, CancellationToken cancellationToken) =>
        repository.CreateCountryAsync(request.CountryName, request.IsoCode);
}
