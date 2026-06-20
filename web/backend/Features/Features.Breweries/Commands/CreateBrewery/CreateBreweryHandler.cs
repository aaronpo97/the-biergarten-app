using Domain.Entities;
using Features.Breweries.Dtos;
using Features.Breweries.Repository;
using MediatR;

namespace Features.Breweries.Commands.CreateBrewery;

/// <summary>
///     Handles <see cref="CreateBreweryCommand" /> by persisting a new brewery post and its location.
/// </summary>
/// <param name="repository">Repository used to persist the new brewery post.</param>
public class CreateBreweryHandler(IBreweryRepository repository)
    : IRequestHandler<CreateBreweryCommand, BreweryDto>
{
    /// <summary>
    ///     Creates a new brewery post, generating new identifiers for the post and its location.
    /// </summary>
    /// <param name="request">The details of the brewery post to create.</param>
    /// <param name="cancellationToken">A token to observe for cancellation requests.</param>
    /// <returns>The newly created brewery post.</returns>
    public async Task<BreweryDto> Handle(CreateBreweryCommand request, CancellationToken cancellationToken)
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
                Coordinates = request.Location.Coordinates
            }
        };

        await repository.CreateAsync(entity);
        return entity.ToDto();
    }
}