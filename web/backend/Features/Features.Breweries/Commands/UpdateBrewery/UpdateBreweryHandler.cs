using Domain.Entities;
using Features.Breweries.Dtos;
using Features.Breweries.Repository;
using MediatR;

namespace Features.Breweries.Commands.UpdateBrewery;

public class UpdateBreweryHandler(IBreweryRepository repository)
    : IRequestHandler<UpdateBreweryCommand, BreweryDto>
{
    /// <summary>
    ///     Updates an existing brewery post. If <paramref name="request" /> has no <c>Location</c>,
    ///     the brewery's location is cleared.
    /// </summary>
    public async Task<BreweryDto> Handle(
        UpdateBreweryCommand request,
        CancellationToken cancellationToken
    )
    {
        BreweryPost entity = new()
        {
            BreweryPostId = request.BreweryPostId,
            PostedById = request.PostedById,
            BreweryName = request.BreweryName,
            Description = request.Description,
            UpdatedAt = DateTime.UtcNow,
            Location = request.Location is null
                ? null
                : new BreweryPostLocation
                {
                    BreweryPostLocationId = request.Location.BreweryPostLocationId,
                    BreweryPostId = request.BreweryPostId,
                    CityId = request.Location.CityId,
                    AddressLine1 = request.Location.AddressLine1,
                    AddressLine2 = request.Location.AddressLine2,
                    PostalCode = request.Location.PostalCode,
                    Coordinates = request.Location.Coordinates,
                },
        };

        await repository.UpdateAsync(entity);
        return entity.ToDto();
    }
}
