using Features.Breweries.Dtos;
using MediatR;

namespace Features.Breweries.Commands.CreateBrewery;

/// <summary>
///     Location data required to create a new brewery post, supplied as part of <see cref="CreateBreweryCommand" />.
/// </summary>
public record CreateBreweryLocation(
    Guid CityId,
    string AddressLine1,
    string? AddressLine2,
    string PostalCode,
    byte[]? Coordinates
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
