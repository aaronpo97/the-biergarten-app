using Domain.Entities;
using Features.Breweries.Dtos;
using Features.Breweries.Repository;
using MediatR;

namespace Features.Breweries.Commands.UpdateBrewery;

/// <summary>
/// Handles <see cref="UpdateBreweryCommand"/> by persisting changes to an existing brewery post.
/// </summary>
/// <param name="repository">Repository used to persist the updated brewery post.</param>
public class UpdateBreweryHandler(IBreweryRepository repository)
    : IRequestHandler<UpdateBreweryCommand, BreweryDto>
{
    /// <summary>
    /// Updates an existing brewery post. If <paramref name="request"/> has no <c>Location</c>,
    /// the brewery's location is cleared.
    /// </summary>
    /// <param name="request">The updated details of the brewery post.</param>
    /// <param name="cancellationToken">A token to observe for cancellation requests.</param>
    /// <returns>The updated brewery post.</returns>
    public async Task<BreweryDto> Handle(UpdateBreweryCommand request, CancellationToken cancellationToken)
    {
        var entity = new BreweryPost
        {
            BreweryPostId = request.BreweryPostId,
            PostedById = request.PostedById,
            BreweryName = request.BreweryName,
            Description = request.Description,
            UpdatedAt = DateTime.UtcNow,
            Location = request.Location is null ? null : new BreweryPostLocation
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
