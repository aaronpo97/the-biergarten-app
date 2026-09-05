using Domain.Entities;
using Features.Breweries.Dtos;
using Features.Breweries.Repository;
using MediatR;

namespace Features.Breweries.Commands.UpdateBrewery;

/// <summary>
///     Persists changes requested through <see cref="UpdateBreweryCommand" />.
/// </summary>
public class UpdateBreweryHandler(IBreweryRepository repository)
    : IRequestHandler<UpdateBreweryCommand, BreweryDto>
{
    /// <summary>
    ///     Updates the post after confirming that the caller owns it.
    /// </summary>
    /// <exception cref="Domain.Exceptions.NotFoundException">
    ///     Thrown if the brewery post or its requested city cannot be found.
    /// </exception>
    /// <exception cref="Domain.Exceptions.ConflictException">
    ///     Thrown if the post has changed since its supplied row version was read.
    /// </exception>
    public async Task<BreweryDto> Handle(
        UpdateBreweryCommand request,
        CancellationToken cancellationToken
    )
    {
        await repository.EnsureCallerOwnsBreweryAsync(
            request.BreweryPostId,
            request.RequestingUserId,
            cancellationToken
        );

        BreweryPost entity = new()
        {
            BreweryPostId = request.BreweryPostId,
            RowVersion = request.RowVersion,
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

        BreweryPost updated = await repository.UpdateAsync(entity, cancellationToken);
        return updated.ToDto();
    }
}
