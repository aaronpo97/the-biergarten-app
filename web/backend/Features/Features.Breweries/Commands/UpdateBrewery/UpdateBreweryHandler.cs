using Domain.Entities;
using Domain.Exceptions;
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
    ///     <c>RowVersion</c> was read.
    /// </exception>
    public async Task<BreweryDto> Handle(
        UpdateBreweryCommand request,
        CancellationToken cancellationToken
    )
    {
        var brewery = await repository.GetByIdAsync(request.BreweryPostId, cancellationToken)
                          ?? throw new NotFoundException($"Brewery with ID {request.BreweryPostId} not found.");

        if (brewery.PostedById != request.RequestingUserId)
            throw new ForbiddenException("You are not authorized to update this brewery.");
        
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

        BreweryPost updated = await repository.UpdateAsync(entity);
        return updated.ToDto();
    }
}
