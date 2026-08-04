using Domain.Entities;
using Features.Breweries.Dtos;
using Features.Breweries.Repository;
using MediatR;

namespace Features.Breweries.Queries.GetAllBreweries;

public class GetAllBreweriesHandler(IBreweryRepository repository)
    : IRequestHandler<GetAllBreweriesQuery, IEnumerable<BreweryDto>>
{
    public async Task<IEnumerable<BreweryDto>> Handle(
        GetAllBreweriesQuery request,
        CancellationToken cancellationToken
    )
    {
        IEnumerable<BreweryPost> breweries = await repository.GetAllAsync(
            request.Limit,
            request.Offset
        );
        return breweries.Select(b => b.ToDto());
    }
}
