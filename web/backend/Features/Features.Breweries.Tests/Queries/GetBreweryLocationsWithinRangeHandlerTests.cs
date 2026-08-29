using Domain.Entities;
using Features.Breweries.Dtos;
using Features.Breweries.Queries.GetBreweryLocationsWithinRange;
using Features.Breweries.Repository;
using FluentAssertions;
using Moq;

namespace Features.Breweries.Tests.Queries;

public class GetBreweryLocationsWithinRangeHandlerTests
{
    private readonly GetBreweryLocationsWithinRangeHandler _handler;
    private readonly Mock<IBreweryRepository> _repoMock = new();

    public GetBreweryLocationsWithinRangeHandlerTests()
    {
        _handler = new GetBreweryLocationsWithinRangeHandler(_repoMock.Object);
    }

    [Fact]
    public async Task Handle_PassesCoordinatesAndRange_ToRepository()
    {
        _repoMock
            .Setup(r =>
                r.GetAllLocationsWithinRange(
                    It.Is<CoordinateData>(c => c.Latitude == 43.6532 && c.Longitude == -79.3832),
                    1000
                )
            )
            .ReturnsAsync(Array.Empty<BreweryPost>());

        IEnumerable<SimplifiedBreweryDto> result = await _handler.Handle(
            new GetBreweryLocationsWithinRangeQuery(43.6532, -79.3832, 1000),
            CancellationToken.None
        );

        result.Should().BeEmpty();
        _repoMock.Verify(
            r =>
                r.GetAllLocationsWithinRange(
                    It.Is<CoordinateData>(c => c.Latitude == 43.6532 && c.Longitude == -79.3832),
                    1000
                ),
            Times.Once
        );
    }

    [Fact]
    public async Task Handle_ReturnsNearbyBreweries_FromRepository()
    {
        BreweryPost[] breweries =
        [
            new BreweryPost { BreweryPostId = Guid.NewGuid(), BreweryName = "Nearby A" },
            new BreweryPost { BreweryPostId = Guid.NewGuid(), BreweryName = "Nearby B" },
        ];
        _repoMock
            .Setup(r => r.GetAllLocationsWithinRange(It.IsAny<CoordinateData>(), It.IsAny<double>()))
            .ReturnsAsync(breweries);

        IEnumerable<SimplifiedBreweryDto> result = await _handler.Handle(
            new GetBreweryLocationsWithinRangeQuery(43.6532, -79.3832, 1000),
            CancellationToken.None
        );

        result
            .Select(b => b.BreweryPostId)
            .Should()
            .BeEquivalentTo(breweries.Select(b => b.BreweryPostId));
    }
}
