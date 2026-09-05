using Domain.Entities;
using Features.Breweries.Dtos;
using Features.Breweries.Repository;
using MediatR;

namespace Features.Breweries.Commands.CreateBrewery;

/// <summary>
///     Persists brewery posts created through <see cref="CreateBreweryCommand" />.
/// </summary>
public class CreateBreweryHandler(IBreweryRepository repository)
    : IRequestHandler<CreateBreweryCommand, BreweryDto>
{
    /// <summary>
    ///     Creates the post and its associated location with new identifiers.
    /// </summary>
    /// <exception cref="Domain.Exceptions.NotFoundException">
    ///     Thrown if the posting user or the selected city cannot be found.
    /// </exception>
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

        BreweryPost created =
            await repository.GetByIdAsync(entity.BreweryPostId, CancellationToken.None)
            ?? throw new InvalidOperationException(
                $"Brewery '{entity.BreweryPostId}' was not found after a successful creation."
            );

        return created.ToDto();
    }
}
