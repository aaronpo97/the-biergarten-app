using Domain.Entities;
using Features.Breweries.Dtos;
using Features.Breweries.Repository;
using MediatR;

namespace Features.Breweries.Commands.CreateBrewery;

/// <summary>Handles <see cref="CreateBreweryCommand" /> by persisting a new brewery post.</summary>
public class CreateBreweryHandler(IBreweryRepository repository)
    : IRequestHandler<CreateBreweryCommand, BreweryDto>
{
    /// <summary>Creates a new brewery post, generating new identifiers for the post and its location.</summary>
    /// <exception cref="Domain.Exceptions.NotFoundException">
    ///     Thrown when <paramref name="request" />'s <c>PostedById</c> or <c>Location.CityId</c> does not exist.
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

        // RowVersion is a DB-computed column, unset on the in-memory entity; re-fetch so callers
        // get back the value needed for a subsequent optimistic-concurrency update. Uses
        // CancellationToken.None since the write already committed: cancelling the caller's request
        // at this point must not turn a successful creation into a thrown exception.
        BreweryPost created =
            await repository.GetByIdAsync(entity.BreweryPostId, CancellationToken.None)
            ?? throw new InvalidOperationException(
                $"Brewery '{entity.BreweryPostId}' was not found after a successful creation."
            );

        return created.ToDto();
    }
}
