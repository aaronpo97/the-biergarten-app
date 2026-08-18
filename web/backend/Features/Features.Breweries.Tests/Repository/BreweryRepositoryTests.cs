using Apps72.Dev.Data.DbMocker;
using Domain.Entities;
using Domain.Exceptions;
using Features.Breweries.Repository;
using FluentAssertions;

namespace Features.Breweries.Tests.Repository;

public class BreweryRepositoryTests
{
    private static BreweryRepository CreateRepo(MockDbConnection conn)
    {
        return new BreweryRepository(new TestConnectionFactory(conn));
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsBrewery_WhenExists()
    {
        Guid breweryId = Guid.NewGuid();
        MockDbConnection conn = new();

        Guid locationId = Guid.NewGuid();

        conn.Mocks.When(cmd => cmd.CommandText.Contains("INNER JOIN dbo.BreweryPostLocation"))
            .ReturnsTable(
                MockTable
                    .WithColumns(
                        ("BreweryPostId", typeof(Guid)),
                        ("PostedById", typeof(Guid)),
                        ("BreweryName", typeof(string)),
                        ("Description", typeof(string)),
                        ("CreatedAt", typeof(DateTime)),
                        ("UpdatedAt", typeof(DateTime?)),
                        ("Timer", typeof(byte[])),
                        ("BreweryPostLocationId", typeof(Guid)),
                        ("CityId", typeof(Guid)),
                        ("AddressLine1", typeof(string)),
                        ("AddressLine2", typeof(string)),
                        ("PostalCode", typeof(string)),
                        ("Coordinates", typeof(byte[]))
                    )
                    .AddRow(
                        breweryId,
                        Guid.NewGuid(),
                        "Test Brewery",
                        "A test brewery description",
                        DateTime.UtcNow,
                        null,
                        null,
                        locationId,
                        Guid.NewGuid(),
                        "123 Main St",
                        null,
                        "12345",
                        null
                    )
            );

        BreweryRepository repo = CreateRepo(conn);
        BreweryPost? result = await repo.GetByIdAsync(breweryId);
        result.Should().NotBeNull();
        result!.BreweryPostId.Should().Be(breweryId);
        result.Location.Should().NotBeNull();
        result.Location!.BreweryPostLocationId.Should().Be(locationId);
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsNull_WhenNotExists()
    {
        MockDbConnection conn = new();
        conn.Mocks.When(cmd => cmd.CommandText.Contains("INNER JOIN dbo.BreweryPostLocation"))
            .ReturnsTable(MockTable.Empty());
        BreweryRepository repo = CreateRepo(conn);
        BreweryPost? result = await repo.GetByIdAsync(Guid.NewGuid());
        result.Should().BeNull();
    }

    [Fact]
    public async Task CreateAsync_ExecutesSuccessfully()
    {
        MockDbConnection conn = new();
        conn.Mocks.When(cmd => cmd.CommandText.Contains("SELECT 1 FROM dbo.UserAccount")).ReturnsScalar(1);
        conn.Mocks.When(cmd => cmd.CommandText.Contains("SELECT 1 FROM dbo.City")).ReturnsScalar(1);
        conn.Mocks.When(cmd => cmd.CommandText.Contains("INSERT INTO dbo.BreweryPost (")).ReturnsScalar(1);
        conn.Mocks.When(cmd => cmd.CommandText.Contains("INSERT INTO dbo.BreweryPostLocation"))
            .ReturnsScalar(1);

        BreweryRepository repo = CreateRepo(conn);
        BreweryPost brewery = new()
        {
            BreweryPostId = Guid.NewGuid(),
            PostedById = Guid.NewGuid(),
            BreweryName = "Test Brewery",
            Description = "A test brewery description",
            CreatedAt = DateTime.UtcNow,
            Location = new BreweryPostLocation
            {
                BreweryPostLocationId = Guid.NewGuid(),
                CityId = Guid.NewGuid(),
                AddressLine1 = "123 Main St",
                PostalCode = "12345",
                Coordinates = [0x00, 0x01],
            },
        };

        // Should not throw
        Func<Task> act = async () => await repo.CreateAsync(brewery);
        await act.Should().NotThrowAsync();
    }

    [Fact]
    public async Task CreateAsync_ThrowsArgumentException_WhenLocationMissing()
    {
        MockDbConnection conn = new();
        BreweryRepository repo = CreateRepo(conn);
        BreweryPost brewery = new()
        {
            BreweryPostId = Guid.NewGuid(),
            PostedById = Guid.NewGuid(),
            BreweryName = "Test Brewery",
            Description = "A test brewery description",
        };

        Func<Task> act = async () => await repo.CreateAsync(brewery);
        await act.Should().ThrowAsync<ArgumentException>();
    }

    [Fact]
    public async Task CreateAsync_ThrowsNotFound_WhenUserMissing()
    {
        MockDbConnection conn = new();
        conn.Mocks.When(cmd => cmd.CommandText.Contains("SELECT 1 FROM dbo.UserAccount"))
            .ReturnsScalar((int?)null);

        BreweryRepository repo = CreateRepo(conn);
        BreweryPost brewery = new()
        {
            BreweryPostId = Guid.NewGuid(),
            PostedById = Guid.NewGuid(),
            BreweryName = "Test Brewery",
            Description = "A test brewery description",
            Location = new BreweryPostLocation
            {
                BreweryPostLocationId = Guid.NewGuid(),
                CityId = Guid.NewGuid(),
                AddressLine1 = "123 Main St",
                PostalCode = "12345",
            },
        };

        Func<Task> act = async () => await repo.CreateAsync(brewery);
        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task CreateAsync_UsesClientProvidedIds()
    {
        MockDbConnection conn = new();
        conn.Mocks.When(cmd => cmd.CommandText.Contains("SELECT 1 FROM dbo.UserAccount")).ReturnsScalar(1);
        conn.Mocks.When(cmd => cmd.CommandText.Contains("SELECT 1 FROM dbo.City")).ReturnsScalar(1);

        Guid? capturedBreweryPostId = null;
        Guid? capturedLocationId = null;

        conn.Mocks.When(cmd => cmd.CommandText.Contains("INSERT INTO dbo.BreweryPost ("))
            .ReturnsScalar(cmd =>
            {
                capturedBreweryPostId = (Guid?)
                    cmd.Parameters.First(p => p.ParameterName == "BreweryPostId").Value;
                return 1;
            });

        conn.Mocks.When(cmd => cmd.CommandText.Contains("INSERT INTO dbo.BreweryPostLocation"))
            .ReturnsScalar(cmd =>
            {
                capturedLocationId = (Guid?)
                    cmd.Parameters.First(p => p.ParameterName == "BreweryPostLocationId").Value;
                return 1;
            });

        Guid expectedBreweryId = Guid.NewGuid();
        Guid expectedLocationId = Guid.NewGuid();

        BreweryRepository repo = CreateRepo(conn);
        BreweryPost brewery = new()
        {
            BreweryPostId = expectedBreweryId,
            PostedById = Guid.NewGuid(),
            BreweryName = "Test Brewery",
            Description = "A test brewery description",
            Location = new BreweryPostLocation
            {
                BreweryPostLocationId = expectedLocationId,
                CityId = Guid.NewGuid(),
                AddressLine1 = "123 Main St",
                PostalCode = "12345",
            },
        };

        await repo.CreateAsync(brewery);

        capturedBreweryPostId.Should().Be(expectedBreweryId);
        capturedLocationId.Should().Be(expectedLocationId);
    }

    [Fact]
    public async Task UpdateAsync_ReturnsFreshlyPersistedBrewery_WhenSuccessful()
    {
        Guid breweryId = Guid.NewGuid();
        byte[] newTimer = [0x00, 0x02];
        MockDbConnection conn = new();

        conn.Mocks.When(cmd =>
                cmd.CommandText.Contains("SELECT 1 FROM dbo.BreweryPost WHERE BreweryPostID")
            )
            .ReturnsScalar(1);
        conn.Mocks.When(cmd => cmd.CommandText.Contains("SELECT 1 FROM dbo.City")).ReturnsScalar(1);
        conn.Mocks.When(cmd =>
                cmd.CommandText.Contains("WHERE BreweryPostID = @BreweryPostId AND Timer = @Timer")
            )
            .ReturnsScalar(1);
        conn.Mocks.When(cmd => cmd.CommandText.Contains("SELECT 1 FROM dbo.BreweryPostLocation"))
            .ReturnsScalar(1);
        conn.Mocks.When(cmd => cmd.CommandText.Contains("UPDATE dbo.BreweryPostLocation"))
            .ReturnsScalar(1);

        // Repository re-fetches the row after a successful update to return the new Timer.
        conn.Mocks.When(cmd => cmd.CommandText.Contains("INNER JOIN dbo.BreweryPostLocation"))
            .ReturnsTable(
                MockTable
                    .WithColumns(
                        ("BreweryPostId", typeof(Guid)),
                        ("PostedById", typeof(Guid)),
                        ("BreweryName", typeof(string)),
                        ("Description", typeof(string)),
                        ("CreatedAt", typeof(DateTime)),
                        ("UpdatedAt", typeof(DateTime?)),
                        ("Timer", typeof(byte[])),
                        ("BreweryPostLocationId", typeof(Guid)),
                        ("CityId", typeof(Guid)),
                        ("AddressLine1", typeof(string)),
                        ("AddressLine2", typeof(string)),
                        ("PostalCode", typeof(string)),
                        ("Coordinates", typeof(byte[]))
                    )
                    .AddRow(
                        breweryId,
                        Guid.NewGuid(),
                        "Renamed Brewery",
                        "Updated description",
                        DateTime.UtcNow,
                        DateTime.UtcNow,
                        newTimer,
                        Guid.NewGuid(),
                        Guid.NewGuid(),
                        "123 Main St",
                        null,
                        "12345",
                        null
                    )
            );

        BreweryRepository repo = CreateRepo(conn);
        BreweryPost brewery = new()
        {
            BreweryPostId = breweryId,
            PostedById = Guid.NewGuid(),
            BreweryName = "Renamed Brewery",
            Description = "Updated description",
            Timer = [0x00, 0x01],
            Location = new BreweryPostLocation
            {
                CityId = Guid.NewGuid(),
                AddressLine1 = "123 Main St",
                PostalCode = "12345",
            },
        };

        BreweryPost result = await repo.UpdateAsync(brewery);

        result.BreweryPostId.Should().Be(breweryId);
        result.Timer.Should().Equal(newTimer);
    }

    [Fact]
    public async Task UpdateAsync_ThrowsNotFound_WhenBreweryMissing()
    {
        MockDbConnection conn = new();
        conn.Mocks.When(cmd =>
                cmd.CommandText.Contains("SELECT 1 FROM dbo.BreweryPost WHERE BreweryPostID")
            )
            .ReturnsScalar((int?)null);

        BreweryRepository repo = CreateRepo(conn);
        BreweryPost brewery = new() { BreweryPostId = Guid.NewGuid(), Timer = [0x00, 0x01] };

        Func<Task> act = async () => await repo.UpdateAsync(brewery);
        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task UpdateAsync_ThrowsConflict_WhenTimerStale()
    {
        MockDbConnection conn = new();
        conn.Mocks.When(cmd =>
                cmd.CommandText.Contains("SELECT 1 FROM dbo.BreweryPost WHERE BreweryPostID")
            )
            .ReturnsScalar(1);

        // Brewery exists but the conditional UPDATE (WHERE ... AND Timer = @Timer) matches no rows,
        // since the caller's Timer no longer matches the stored row.
        conn.Mocks.When(cmd =>
                cmd.CommandText.Contains("WHERE BreweryPostID = @BreweryPostId AND Timer = @Timer")
            )
            .ReturnsScalar(0);

        BreweryRepository repo = CreateRepo(conn);
        BreweryPost brewery = new()
        {
            BreweryPostId = Guid.NewGuid(),
            BreweryName = "Renamed Brewery",
            Description = "Updated description",
            Timer = [0x00, 0x01],
        };

        Func<Task> act = async () => await repo.UpdateAsync(brewery);
        await act.Should().ThrowAsync<ConflictException>();
    }
}
