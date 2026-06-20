using Domain.Entities;
using Features.Breweries.Dtos;
using Features.Breweries.Repository;
using MediatR;

namespace Features.Breweries.Queries.GetAllBreweries;

/// <summary>
///     Handles <see cref="GetAllBreweriesQuery" /> by retrieving a paginated list of brewery posts.
/// </summary>
/// <param name="repository">Repository used to query brewery post data.</param>
public class GetAllBreweriesHandler(IBreweryRepository repository)
    : IRequestHandler<GetAllBreweriesQuery, IEnumerable<BreweryDto>>
{
    public async Task<IEnumerable<BreweryDto>> Handle(GetAllBreweriesQuery request, CancellationToken cancellationToken)
    {
        IEnumerable<BreweryPost> breweries = await repository.GetAllAsync(request.Limit, request.Offset);
        return breweries.Select(b => b.ToDto());
    }
}