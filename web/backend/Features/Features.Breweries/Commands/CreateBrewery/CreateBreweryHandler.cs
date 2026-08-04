using Domain.Entities;
using Features.Breweries.Dtos;
using Features.Breweries.Repository;
using MediatR;

namespace Features.Breweries.Commands.CreateBrewery;

public class CreateBreweryHandler(IBreweryRepository repository)
    : IRequestHandler<CreateBreweryCommand, BreweryDto>
{
    /// <summary>Creates a new brewery post, generating new identifiers for the post and its location.</summary>
    public async Task<BreweryDto> Handle(
        CreateBreweryCommand request,
        CancellationToken cancellationToken
    )
    {
        BreweryPost entity = new()
        {
            BreweryPostId = Guid.NewGuid(),
            PostedById = request.PostedById,
            BreweryName = request.BreweryName,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow,
            Location = new BreweryPostLocation
            {
                BreweryPostLocationId = Guid.NewGuid(),
                CityId = request.Location.CityId,
                AddressLine1 = request.Location.AddressLine1,
                AddressLine2 = request.Location.AddressLine2,
                PostalCode = request.Location.PostalCode,
                Coordinates = request.Location.Coordinates,
            },
        };

        await repository.CreateAsync(entity);
        return entity.ToDto();
    }
}
