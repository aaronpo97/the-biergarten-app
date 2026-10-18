using MediatR;

namespace Features.Breweries.Queries.GetBreweryCount;

/// <summary>
///     Requests the total number of brewery posts.
/// </summary>
public record GetBreweryCountQuery : IRequest<int>;
