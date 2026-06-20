using Features.Breweries.Dtos;
using MediatR;

namespace Features.Breweries.Commands.UpdateBrewery;

/// <summary>
///     Location data for an existing brewery post, supplied as part of <see cref="UpdateBreweryCommand" />.
/// </summary>
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
///     A <c>null</c> <see cref="Location" /> clears the brewery's location.
/// </summary>
public record UpdateBreweryCommand(
    Guid BreweryPostId,
    Guid PostedById,
    string BreweryName,
    string Description,
    UpdateBreweryLocation? Location
) : IRequest<BreweryDto>;