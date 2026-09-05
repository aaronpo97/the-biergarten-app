using Domain.Entities;
using Features.Breweries.Dtos;
using MediatR;

namespace Features.Breweries.Commands.UpdateBrewery;

/// <summary>
///     Describes the location supplied when updating a brewery.
/// </summary>
/// <param name="BreweryPostLocationId">
///     Identifies the existing location; a new location is created when needed.
/// </param>
/// <param name="Coordinates">
///     Serialized geographic coordinates for the brewery.
/// </param>
public record UpdateBreweryLocation(
    Guid BreweryPostLocationId,
    Guid CityId,
    string AddressLine1,
    string? AddressLine2,
    string PostalCode,
    CoordinateData? Coordinates
);

/// <summary>
///     Represents a concurrency-protected change to an existing brewery post.
///     A <see langword="null" /> <see cref="Location" /> removes the existing location.
/// </summary>
public record UpdateBreweryCommand(
    Guid BreweryPostId,
    Guid RequestingUserId,
    byte[] RowVersion,
    string BreweryName,
    string Description,
    UpdateBreweryLocation? Location
) : IRequest<BreweryDto>;

/// <summary>
///     Defines the client-supplied body for updating a brewery post.
/// </summary>
public record UpdateBreweryRequest(
    Guid BreweryPostId,
    byte[] RowVersion,
    string BreweryName,
    string Description,
    UpdateBreweryLocation? Location
);
