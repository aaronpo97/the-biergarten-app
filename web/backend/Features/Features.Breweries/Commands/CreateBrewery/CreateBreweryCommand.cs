using Domain.Entities;
using Features.Breweries.Dtos;
using MediatR;

namespace Features.Breweries.Commands.CreateBrewery;

/// <summary>
///     Describes the location supplied when creating a brewery.
/// </summary>
/// <param name="Coordinates">
///     Serialized geographic coordinates for the brewery.
/// </param>
public record CreateBreweryLocation(
    Guid CityId,
    string AddressLine1,
    string? AddressLine2,
    string PostalCode,
    CoordinateData? Coordinates
);

/// <summary>
///     Represents the application request used to create a brewery post.
/// </summary>
public record CreateBreweryCommand(
    Guid PostedById,
    string BreweryName,
    string Description,
    CreateBreweryLocation Location
) : IRequest<BreweryDto>;

/// <summary>
///     Defines the client-supplied body for creating a brewery post.
/// </summary>
public record CreateBreweryRequest(
    string BreweryName,
    string Description,
    CreateBreweryLocation Location
);
