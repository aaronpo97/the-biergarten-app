using Domain.Entities;
using Features.Breweries.Dtos;
using Features.Breweries.Repository;
using MediatR;

namespace Features.Breweries.Queries.GetBreweryById;

public class GetBreweryByIdHandler(IBreweryRepository repository)
    : IRequestHandler<GetBreweryByIdQuery, BreweryDto?>
{
    public async Task<BreweryDto?> Handle(
        GetBreweryByIdQuery request,
        CancellationToken cancellationToken
    )
    {
        BreweryPost? brewery = await repository.GetByIdAsync(request.BreweryPostId);
        return brewery?.ToDto();
    }
}
