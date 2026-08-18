using Domain.Entities;
using Features.Breweries.Dtos;
using Features.Breweries.Repository;
using MediatR;

namespace Features.Breweries.Commands.UpdateBrewery;

/// <summary>Handles <see cref="UpdateBreweryCommand" /> by persisting changes to an existing brewery post.</summary>
public class UpdateBreweryHandler(IBreweryRepository repository)
    : IRequestHandler<UpdateBreweryCommand, BreweryDto>
{
    /// <summary>
    ///     Updates an existing brewery post. If <paramref name="request" /> has no <c>Location</c>,
    ///     the brewery's location is cleared.
    /// </summary>
    /// <exception cref="Domain.Exceptions.NotFoundException">
    ///     Thrown when no brewery exists with <paramref name="request" />'s <c>BreweryPostId</c>, or its
    ///     location's <c>CityId</c> does not exist.
    /// </exception>
    /// <exception cref="Domain.Exceptions.ConflictException">
    ///     Thrown when the brewery was modified by another request since <paramref name="request" />.
    ///     <c>Timer</c> was read.
    /// </exception>
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
            Timer = request.Timer,
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

        BreweryPost updated = await repository.UpdateAsync(entity);
        return updated.ToDto();
    }
}
