using Features.Breweries.Queries.GetBreweryCount;
using Features.Breweries.Repository;
using FluentAssertions;
using Moq;

namespace Features.Breweries.Tests.Queries;

public class GetBreweryCountHandlerTests
{
    private readonly GetBreweryCountHandler _handler;
    private readonly Mock<IBreweryRepository> _repoMock = new();

    public GetBreweryCountHandlerTests()
    {
        _handler = new GetBreweryCountHandler(_repoMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsZero_WhenNoBreweriesExist()
    {
        _repoMock.Setup(r => r.GetCountAsync(It.IsAny<CancellationToken>())).ReturnsAsync(0);

        int result = await _handler.Handle(new GetBreweryCountQuery(), CancellationToken.None);

        result.Should().Be(0);
    }

    [Fact]
    public async Task Handle_ReturnsRepositoryCount()
    {
        _repoMock.Setup(r => r.GetCountAsync(It.IsAny<CancellationToken>())).ReturnsAsync(42);

        int result = await _handler.Handle(new GetBreweryCountQuery(), CancellationToken.None);

        result.Should().Be(42);
        _repoMock.Verify(r => r.GetCountAsync(It.IsAny<CancellationToken>()), Times.Once);
    }
}
