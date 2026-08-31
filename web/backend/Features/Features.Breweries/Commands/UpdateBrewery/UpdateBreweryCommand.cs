using Domain.Entities;
using Features.Breweries.Dtos;
using MediatR;

namespace Features.Breweries.Commands.UpdateBrewery;

/// <summary>Location details for a brewery being updated.</summary>
/// <param name="BreweryPostLocationId">
///     Identifier of the existing location row, if any; a new row is created if none exists yet.
/// </param>
/// <param name="Coordinates">Raw binary representation of the brewery's geographic coordinates.</param>
public record UpdateBreweryLocation(
    Guid BreweryPostLocationId,
    Guid CityId,
    string AddressLine1,
    string? AddressLine2,
    string PostalCode,
    CoordinateData? Coordinates
);

/// <summary>
///     Updates an existing brewery post. A <c>null</c> <see cref="Location" /> clears the brewery's location.
///     <see cref="RowVersion" /> must be the row-version last read for this brewery (e.g. from a prior
///     <c>GET</c>); the update is rejected with a <c>409 Conflict</c> if the brewery was modified since then.
/// </summary>
public record UpdateBreweryCommand(
    Guid BreweryPostId,
    Guid RequestingUserId,
    byte[] RowVersion,
    string BreweryName,
    string Description,
    UpdateBreweryLocation? Location
) : IRequest<BreweryDto>;

/// <summary>Request body for <c>PUT /api/brewery/{id}</c>.</summary>
public record UpdateBreweryRequest(
    Guid BreweryPostId,
    byte[] RowVersion,
    string BreweryName,
    string Description,
    UpdateBreweryLocation? Location
);

