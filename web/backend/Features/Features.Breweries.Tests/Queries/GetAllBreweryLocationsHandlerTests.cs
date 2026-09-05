using Domain.Entities;
using Features.Breweries.Dtos;
using Features.Breweries.Queries.GetAllBreweryLocations;
using Features.Breweries.Repository;
using FluentAssertions;
using Moq;

namespace Features.Breweries.Tests.Queries;

public class GetAllBreweryLocationsHandlerTests
{
    private readonly GetAllBreweryLocationsHandler _handler;
    private readonly Mock<IBreweryRepository> _repoMock = new();

    public GetAllBreweryLocationsHandlerTests()
    {
        _handler = new GetAllBreweryLocationsHandler(_repoMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsEmpty_WhenNoBreweriesHaveALocation()
    {
        _repoMock.Setup(r => r.GetAllLocations()).ReturnsAsync(Array.Empty<BreweryPost>());

        IEnumerable<BreweryWithLocationDto> result = await _handler.Handle(
            new GetAllBreweryLocationsQuery(),
            CancellationToken.None
        );

        result.Should().BeEmpty();
        _repoMock.Verify(r => r.GetAllLocations(), Times.Once);
    }

    [Fact]
    public async Task Handle_ReturnsAllLocatedBreweries_FromRepository()
    {
        BreweryPost[] breweries =
        [
            new()
                { BreweryPostId = Guid.NewGuid(), BreweryName = "A" },
            new()
                { BreweryPostId = Guid.NewGuid(), BreweryName = "B" },
        ];
        _repoMock.Setup(r => r.GetAllLocations()).ReturnsAsync(breweries);

        IEnumerable<BreweryWithLocationDto> result = await _handler.Handle(
            new GetAllBreweryLocationsQuery(),
            CancellationToken.None
        );

        result
            .Select(b => b.BreweryPostId)
            .Should()
            .BeEquivalentTo(breweries.Select(b => b.BreweryPostId));
    }
}
