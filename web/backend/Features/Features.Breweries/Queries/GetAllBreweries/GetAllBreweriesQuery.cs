using Features.Breweries.Dtos;
using MediatR;

namespace Features.Breweries.Queries.GetAllBreweries;

/// <summary>
///     Requests brewery posts ordered from newest to oldest.
/// </summary>
/// <param name="Limit">
///     Caps the result count; <see langword="null" /> disables the cap.
/// </param>
/// <param name="Offset">
///     Specifies the number of results to skip; <see langword="null" /> means zero.
/// </param>
public record GetAllBreweriesQuery(int? Limit, int? Offset) : IRequest<IEnumerable<BreweryDto>>;
