using Domain.Entities;
using Features.Breweries.Dtos;
using Features.Breweries.Queries.GetBreweryById;
using Features.Breweries.Repository;
using FluentAssertions;
using Moq;

namespace Features.Breweries.Tests.Queries;

public class GetBreweryByIdHandlerTests
{
    private readonly GetBreweryByIdHandler _handler;
    private readonly Mock<IBreweryRepository> _repoMock = new();

    public GetBreweryByIdHandlerTests()
    {
        _handler = new GetBreweryByIdHandler(_repoMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsBrewery_WhenFound()
    {
        BreweryPost brewery = new() { BreweryPostId = Guid.NewGuid(), BreweryName = "Test" };
        _repoMock.Setup(r => r.GetByIdAsync(brewery.BreweryPostId)).ReturnsAsync(brewery);

        BreweryDto? result = await _handler.Handle(
            new GetBreweryByIdQuery(brewery.BreweryPostId),
            CancellationToken.None
        );

        result.Should().NotBeNull();
        result.BreweryPostId.Should().Be(brewery.BreweryPostId);
    }

    [Fact]
    public async Task Handle_ReturnsNull_WhenNotFound()
    {
        Guid id = Guid.NewGuid();
        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync((BreweryPost?)null);

        BreweryDto? result = await _handler.Handle(
            new GetBreweryByIdQuery(id),
            CancellationToken.None
        );

        result.Should().BeNull();
    }
}
