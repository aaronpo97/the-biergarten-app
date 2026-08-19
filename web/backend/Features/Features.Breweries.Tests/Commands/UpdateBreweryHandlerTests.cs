using Domain.Entities;
using Features.Breweries.Commands.UpdateBrewery;
using Features.Breweries.Repository;
using FluentAssertions;
using Moq;

namespace Features.Breweries.Tests.Commands;

public class UpdateBreweryHandlerTests
{
    private readonly UpdateBreweryHandler _handler;
    private readonly Mock<IBreweryRepository> _repoMock = new();

    public UpdateBreweryHandlerTests()
    {
        _handler = new UpdateBreweryHandler(_repoMock.Object);
    }

    [Fact]
    public async Task Handle_UpdatesNameDescription_AndSetsUpdatedAt()
    {
        UpdateBreweryCommand command = new(
            Guid.NewGuid(),
            [0x01, 0x02],
            Guid.NewGuid(),
            "Renamed",
            "New description",
            null
        );

        BreweryPost? persisted = null;
        _repoMock
            .Setup(r => r.UpdateAsync(It.IsAny<BreweryPost>()))
            .Callback<BreweryPost>(b => persisted = b)
            .ReturnsAsync(() => persisted!);

        DateTime before = DateTime.UtcNow;
        await _handler.Handle(command, CancellationToken.None);
        DateTime after = DateTime.UtcNow;

        persisted.Should().NotBeNull();
        persisted!.BreweryPostId.Should().Be(command.BreweryPostId);
        persisted.PostedById.Should().Be(command.PostedById);
        persisted.BreweryName.Should().Be("Renamed");
        persisted.Description.Should().Be("New description");
        persisted.RowVersion.Should().Equal(command.RowVersion);
        persisted.UpdatedAt.Should().NotBeNull();
        persisted.UpdatedAt!.Value.Should().BeOnOrAfter(before).And.BeOnOrBefore(after);
    }

    [Fact]
    public async Task Handle_ClearsLocation_WhenCommandLocationIsNull()
    {
        UpdateBreweryCommand command = new(
            Guid.NewGuid(),
            [0x01, 0x02],
            Guid.NewGuid(),
            "Name",
            "Description",
            null
        );

        BreweryPost? persisted = null;
        _repoMock
            .Setup(r => r.UpdateAsync(It.IsAny<BreweryPost>()))
            .Callback<BreweryPost>(b => persisted = b)
            .ReturnsAsync(() => persisted!);

        await _handler.Handle(command, CancellationToken.None);

        persisted!.Location.Should().BeNull();
    }

    [Fact]
    public async Task Handle_SetsLocation_WhenCommandLocationProvided()
    {
        UpdateBreweryLocation locationCommand = new(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "456 Oak Ave",
            "Suite 2",
            "54321",
            null
        );
        UpdateBreweryCommand command = new(
            Guid.NewGuid(),
            [0x01, 0x02],
            Guid.NewGuid(),
            "Name",
            "Description",
            locationCommand
        );

        BreweryPost? persisted = null;
        _repoMock
            .Setup(r => r.UpdateAsync(It.IsAny<BreweryPost>()))
            .Callback<BreweryPost>(b => persisted = b)
            .ReturnsAsync(() => persisted!);

        await _handler.Handle(command, CancellationToken.None);

        persisted!.Location.Should().NotBeNull();
        persisted
            .Location!.BreweryPostLocationId.Should()
            .Be(locationCommand.BreweryPostLocationId);
        persisted.Location.BreweryPostId.Should().Be(command.BreweryPostId);
        persisted.Location.CityId.Should().Be(locationCommand.CityId);
        persisted.Location.AddressLine1.Should().Be(locationCommand.AddressLine1);
        persisted.Location.AddressLine2.Should().Be(locationCommand.AddressLine2);
        persisted.Location.PostalCode.Should().Be(locationCommand.PostalCode);
    }
}
