using Domain.Entities;
using FluentAssertions;
using Features.Breweries.Commands.UpdateBrewery;
using Features.Breweries.Repository;
using Moq;

namespace Features.Breweries.Tests.Commands;

public class UpdateBreweryHandlerTests
{
    private readonly Mock<IBreweryRepository> _repoMock = new();
    private readonly UpdateBreweryHandler _handler;

    public UpdateBreweryHandlerTests()
    {
        _handler = new UpdateBreweryHandler(_repoMock.Object);
    }

    [Fact]
    public async Task Handle_UpdatesNameDescription_AndSetsUpdatedAt()
    {
        var command = new UpdateBreweryCommand(
            BreweryPostId: Guid.NewGuid(),
            PostedById: Guid.NewGuid(),
            BreweryName: "Renamed",
            Description: "New description",
            Location: null
        );

        BreweryPost? persisted = null;
        _repoMock
            .Setup(r => r.UpdateAsync(It.IsAny<BreweryPost>()))
            .Callback<BreweryPost>(b => persisted = b)
            .Returns(Task.CompletedTask);

        var before = DateTime.UtcNow;
        await _handler.Handle(command, CancellationToken.None);
        var after = DateTime.UtcNow;

        persisted.Should().NotBeNull();
        persisted!.BreweryPostId.Should().Be(command.BreweryPostId);
        persisted.PostedById.Should().Be(command.PostedById);
        persisted.BreweryName.Should().Be("Renamed");
        persisted.Description.Should().Be("New description");
        persisted.UpdatedAt.Should().NotBeNull();
        persisted.UpdatedAt!.Value.Should().BeOnOrAfter(before).And.BeOnOrBefore(after);
    }

    [Fact]
    public async Task Handle_ClearsLocation_WhenCommandLocationIsNull()
    {
        var command = new UpdateBreweryCommand(
            BreweryPostId: Guid.NewGuid(),
            PostedById: Guid.NewGuid(),
            BreweryName: "Name",
            Description: "Description",
            Location: null
        );

        BreweryPost? persisted = null;
        _repoMock
            .Setup(r => r.UpdateAsync(It.IsAny<BreweryPost>()))
            .Callback<BreweryPost>(b => persisted = b)
            .Returns(Task.CompletedTask);

        await _handler.Handle(command, CancellationToken.None);

        persisted!.Location.Should().BeNull();
    }

    [Fact]
    public async Task Handle_SetsLocation_WhenCommandLocationProvided()
    {
        var locationCommand = new UpdateBreweryLocation(
            BreweryPostLocationId: Guid.NewGuid(),
            CityId: Guid.NewGuid(),
            AddressLine1: "456 Oak Ave",
            AddressLine2: "Suite 2",
            PostalCode: "54321",
            Coordinates: null
        );
        var command = new UpdateBreweryCommand(
            BreweryPostId: Guid.NewGuid(),
            PostedById: Guid.NewGuid(),
            BreweryName: "Name",
            Description: "Description",
            Location: locationCommand
        );

        BreweryPost? persisted = null;
        _repoMock
            .Setup(r => r.UpdateAsync(It.IsAny<BreweryPost>()))
            .Callback<BreweryPost>(b => persisted = b)
            .Returns(Task.CompletedTask);

        await _handler.Handle(command, CancellationToken.None);

        persisted!.Location.Should().NotBeNull();
        persisted.Location!.BreweryPostLocationId.Should().Be(locationCommand.BreweryPostLocationId);
        persisted.Location.BreweryPostId.Should().Be(command.BreweryPostId);
        persisted.Location.CityId.Should().Be(locationCommand.CityId);
        persisted.Location.AddressLine1.Should().Be(locationCommand.AddressLine1);
        persisted.Location.AddressLine2.Should().Be(locationCommand.AddressLine2);
        persisted.Location.PostalCode.Should().Be(locationCommand.PostalCode);
    }
}
