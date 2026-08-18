using Features.Breweries.Dtos;
using MediatR;

namespace Features.Breweries.Queries.GetAllBreweries;

public record GetAllBreweriesQuery(int? Limit, int? Offset) : IRequest<IEnumerable<BreweryDto>>;
