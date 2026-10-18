using Features.Breweries.Repository;
using MediatR;

namespace Features.Breweries.Queries.GetBreweryCount;

/// <summary>
///     Handles queries for the total number of brewery posts.
/// </summary>
public class GetBreweryCountHandler(IBreweryRepository repository)
    : IRequestHandler<GetBreweryCountQuery, int>
{
    /// <summary>
    ///     Retrieves the total number of brewery posts.
    /// </summary>
    public Task<int> Handle(GetBreweryCountQuery request, CancellationToken cancellationToken) =>
        repository.GetCountAsync(cancellationToken);
}
