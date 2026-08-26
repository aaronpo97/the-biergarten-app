using Domain.Entities;
using Features.Breweries.Dtos;
using MediatR;

namespace Features.Breweries.Commands.CreateBrewery;

/// <summary>Location details for a brewery being created.</summary>
/// <param name="Coordinates">Raw binary representation of the brewery's geographic coordinates.</param>
public record CreateBreweryLocation(
    Guid CityId,
    string AddressLine1,
    string? AddressLine2,
    string PostalCode,
    CoordinateData? Coordinates
);

/// <summary>
///     Creates a new brewery post. Bound directly from the request body of <c>POST /api/brewery</c>.
/// </summary>
public record CreateBreweryCommand(
    Guid PostedById,
    string BreweryName,
    string Description,
    CreateBreweryLocation Location
) : IRequest<BreweryDto>;
