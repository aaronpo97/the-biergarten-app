using Domain.Entities;
using Domain.Exceptions;
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

    private void SetUpExistingBrewery(Guid breweryPostId, Guid postedById)
    {
        _repoMock
            .Setup(r => r.GetPostedByIdAsync(breweryPostId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(postedById);
    }

    [Fact]
    public async Task Handle_UpdatesNameDescription_AndSetsUpdatedAt()
    {
        Guid breweryPostId = Guid.NewGuid();
        Guid requestingUserId = Guid.NewGuid();
        SetUpExistingBrewery(breweryPostId, requestingUserId);

        UpdateBreweryCommand command = new(
            breweryPostId,
            requestingUserId,
            [0x01, 0x02],
            "Renamed",
            "New description",
            null
        );

        BreweryPost? persisted = null;
        _repoMock
            .Setup(r => r.UpdateAsync(It.IsAny<BreweryPost>(), It.IsAny<CancellationToken>()))
            .Callback<BreweryPost, CancellationToken>((b, _) => persisted = b)
            .ReturnsAsync(() => persisted!);

        DateTime before = DateTime.UtcNow;
        await _handler.Handle(command, CancellationToken.None);
        DateTime after = DateTime.UtcNow;

        persisted.Should().NotBeNull();
        persisted!.BreweryPostId.Should().Be(command.BreweryPostId);
        persisted.BreweryName.Should().Be("Renamed");
        persisted.Description.Should().Be("New description");
        persisted.RowVersion.Should().Equal(command.RowVersion);
        persisted.UpdatedAt.Should().NotBeNull();
        persisted.UpdatedAt!.Value.Should().BeOnOrAfter(before).And.BeOnOrBefore(after);
    }

    [Fact]
    public async Task Handle_ClearsLocation_WhenCommandLocationIsNull()
    {
        Guid breweryPostId = Guid.NewGuid();
        Guid requestingUserId = Guid.NewGuid();
        SetUpExistingBrewery(breweryPostId, requestingUserId);

        UpdateBreweryCommand command = new(
            breweryPostId,
            requestingUserId,
            [0x01, 0x02],
            "Name",
            "Description",
            null
        );

        BreweryPost? persisted = null;
        _repoMock
            .Setup(r => r.UpdateAsync(It.IsAny<BreweryPost>(), It.IsAny<CancellationToken>()))
            .Callback<BreweryPost, CancellationToken>((b, _) => persisted = b)
            .ReturnsAsync(() => persisted!);

        await _handler.Handle(command, CancellationToken.None);

        persisted!.Location.Should().BeNull();
    }

    [Fact]
    public async Task Handle_SetsLocation_WhenCommandLocationProvided()
    {
        Guid breweryPostId = Guid.NewGuid();
        Guid requestingUserId = Guid.NewGuid();
        SetUpExistingBrewery(breweryPostId, requestingUserId);

        UpdateBreweryLocation locationCommand = new(
            Guid.NewGuid(),
            Guid.NewGuid(),
            "456 Oak Ave",
            "Suite 2",
            "54321",
            null
        );
        UpdateBreweryCommand command = new(
            breweryPostId,
            requestingUserId,
            [0x01, 0x02],
            "Name",
            "Description",
            locationCommand
        );

        BreweryPost? persisted = null;
        _repoMock
            .Setup(r => r.UpdateAsync(It.IsAny<BreweryPost>(), It.IsAny<CancellationToken>()))
            .Callback<BreweryPost, CancellationToken>((b, _) => persisted = b)
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

    [Fact]
    public async Task Handle_ThrowsNotFoundException_WhenBreweryDoesNotExist()
    {
        UpdateBreweryCommand command = new(
            Guid.NewGuid(),
            Guid.NewGuid(),
            [0x01, 0x02],
            "Name",
            "Description",
            null
        );

        Func<Task> act = () => _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task Handle_ThrowsForbiddenException_WhenRequestingUserIsNotThePoster()
    {
        Guid breweryPostId = Guid.NewGuid();
        SetUpExistingBrewery(breweryPostId, Guid.NewGuid());

        UpdateBreweryCommand command = new(
            breweryPostId,
            Guid.NewGuid(),
            [0x01, 0x02],
            "Name",
            "Description",
            null
        );

        Func<Task> act = () => _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<ForbiddenException>();
    }
}
