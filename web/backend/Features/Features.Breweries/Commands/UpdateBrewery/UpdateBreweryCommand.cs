using Features.Breweries.Dtos;
using MediatR;

namespace Features.Breweries.Commands.UpdateBrewery;

public record UpdateBreweryLocation(
    Guid BreweryPostLocationId,
    Guid CityId,
    string AddressLine1,
    string? AddressLine2,
    string PostalCode,
    byte[]? Coordinates
);

/// <summary>
///     Updates an existing brewery post. Bound directly from the request body of <c>PUT /api/brewery/{id}</c>.
///     A <c>null</c> <see cref="Location" /> clears the brewery's location. <see cref="Timer" /> must be the
///     row-version last read for this brewery (e.g. from a prior <c>GET</c>); the update is rejected with a
///     <c>409 Conflict</c> if the brewery was modified since then.
/// </summary>
public record UpdateBreweryCommand(
    Guid BreweryPostId,
    byte[] Timer,
    Guid PostedById,
    string BreweryName,
    string Description,
    UpdateBreweryLocation? Location
) : IRequest<BreweryDto>;
