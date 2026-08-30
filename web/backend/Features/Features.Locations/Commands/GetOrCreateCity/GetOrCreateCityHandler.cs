using Features.Locations.Repository;
using MediatR;

namespace Features.Locations.Commands.GetOrCreateCity;

/// <summary>Handles <see cref="GetOrCreateCityCommand" /> by delegating to <see cref="ILocationRepository" />.</summary>
public class GetOrCreateCityHandler(ILocationRepository repository)
    : IRequestHandler<GetOrCreateCityCommand, Guid>
{
    public Task<Guid> Handle(GetOrCreateCityCommand request, CancellationToken cancellationToken) =>
        repository.GetOrCreateCityIdAsync(request.City);
}
