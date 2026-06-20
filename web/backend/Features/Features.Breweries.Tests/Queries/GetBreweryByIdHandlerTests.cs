using Domain.Entities;
using FluentAssertions;
using Features.Breweries.Queries.GetBreweryById;
using Features.Breweries.Repository;
using Moq;

namespace Features.Breweries.Tests.Queries;

public class GetBreweryByIdHandlerTests
{
    private readonly Mock<IBreweryRepository> _repoMock = new();
    private readonly GetBreweryByIdHandler _handler;

    public GetBreweryByIdHandlerTests()
    {
        _handler = new GetBreweryByIdHandler(_repoMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsBrewery_WhenFound()
    {
        var brewery = new BreweryPost { BreweryPostId = Guid.NewGuid(), BreweryName = "Test" };
        _repoMock.Setup(r => r.GetByIdAsync(brewery.BreweryPostId))
            .ReturnsAsync(brewery);

        var result = await _handler.Handle(new GetBreweryByIdQuery(brewery.BreweryPostId), CancellationToken.None);

        result.Should().NotBeNull();
        result!.BreweryPostId.Should().Be(brewery.BreweryPostId);
    }

    [Fact]
    public async Task Handle_ReturnsNull_WhenNotFound()
    {
        var id = Guid.NewGuid();
        _repoMock.Setup(r => r.GetByIdAsync(id))
            .ReturnsAsync((BreweryPost?)null);

        var result = await _handler.Handle(new GetBreweryByIdQuery(id), CancellationToken.None);

        result.Should().BeNull();
    }
}
