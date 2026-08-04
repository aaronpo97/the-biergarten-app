using Features.Breweries.Dtos;
using MediatR;

namespace Features.Breweries.Queries.GetBreweryById;

public record GetBreweryByIdQuery(Guid BreweryPostId) : IRequest<BreweryDto?>;
