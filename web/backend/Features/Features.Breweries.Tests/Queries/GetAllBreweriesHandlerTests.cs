using Domain.Entities;
using FluentAssertions;
using Features.Breweries.Queries.GetAllBreweries;
using Features.Breweries.Repository;
using Moq;

namespace Features.Breweries.Tests.Queries;

public class GetAllBreweriesHandlerTests
{
    private readonly Mock<IBreweryRepository> _repoMock = new();
    private readonly GetAllBreweriesHandler _handler;

    public GetAllBreweriesHandlerTests()
    {
        _handler = new GetAllBreweriesHandler(_repoMock.Object);
    }

    [Fact]
    public async Task Handle_PassesLimitAndOffset_ToRepository()
    {
        _repoMock.Setup(r => r.GetAllAsync(10, 5))
            .ReturnsAsync(Array.Empty<BreweryPost>());

        var result = await _handler.Handle(new GetAllBreweriesQuery(10, 5), CancellationToken.None);

        result.Should().BeEmpty();
        _repoMock.Verify(r => r.GetAllAsync(10, 5), Times.Once);
    }

    [Fact]
    public async Task Handle_ReturnsAllBreweries_FromRepository()
    {
        var breweries = new[]
        {
            new BreweryPost { BreweryPostId = Guid.NewGuid(), BreweryName = "A" },
            new BreweryPost { BreweryPostId = Guid.NewGuid(), BreweryName = "B" },
        };
        _repoMock.Setup(r => r.GetAllAsync(null, null))
            .ReturnsAsync(breweries);

        var result = await _handler.Handle(new GetAllBreweriesQuery(null, null), CancellationToken.None);

        result.Select(b => b.BreweryPostId).Should().BeEquivalentTo(breweries.Select(b => b.BreweryPostId));
    }
}
