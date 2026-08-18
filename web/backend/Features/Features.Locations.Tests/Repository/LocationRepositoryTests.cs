using Apps72.Dev.Data.DbMocker;
using Domain.Exceptions;
using Features.Locations.Dtos;
using Features.Locations.Repository;
using FluentAssertions;

namespace Features.Locations.Tests.Repository;

public class LocationRepositoryTests
{
    private static readonly CityLocation Location = new(
        "London",
        "Ontario",
        "CA-ON",
        "Canada",
        "CA"
    );

    private static LocationRepository CreateRepo(MockDbConnection conn)
    {
        return new LocationRepository(new TestConnectionFactory(conn));
    }

    // DbMocker's ReturnsScalar(Guid) doesn't round-trip correctly (it returns an unrelated value
    // instead of the Guid), so every scalar Guid lookup here is faked via a single-row/single-column
    // ReturnsTable instead -- ExecuteScalar reads a mocked table's first cell correctly.
    private static MockTable GuidTable(Guid id)
    {
        return MockTable.WithColumns(("Value", typeof(Guid))).AddRow(id);
    }

    [Fact]
    public async Task GetOrCreateCityIdAsync_ReturnsExistingCityId_WhenFullChainAlreadyExists()
    {
        Guid countryId = Guid.NewGuid();
        Guid stateProvinceId = Guid.NewGuid();
        Guid cityId = Guid.NewGuid();
        MockDbConnection conn = new();

        conn.Mocks.When(cmd => cmd.CommandText.Contains("FROM dbo.Country"))
            .ReturnsTable(GuidTable(countryId));
        conn.Mocks.When(cmd => cmd.CommandText.Contains("FROM dbo.StateProvince"))
            .ReturnsTable(GuidTable(stateProvinceId));
        conn.Mocks.When(cmd => cmd.CommandText.Contains("FROM dbo.City c"))
            .ReturnsTable(GuidTable(cityId));

        LocationRepository repo = CreateRepo(conn);

        // No INSERT is mocked; if the repository tried to create anything despite the chain
        // already existing, this would fail with a MockException.
        Guid result = await repo.GetOrCreateCityIdAsync(Location);

        result.Should().Be(cityId);
    }

    [Fact]
    public async Task GetOrCreateCityIdAsync_CreatesFullChain_WhenNothingExists()
    {
        Guid countryId = Guid.NewGuid();
        Guid stateProvinceId = Guid.NewGuid();
        Guid cityId = Guid.NewGuid();
        MockDbConnection conn = new();

        // First lookup (before creation) returns no rows; second lookup (after insert) returns the ID.
        int countryLookups = 0;
        conn.Mocks.When(cmd => cmd.CommandText.Contains("SELECT CountryID FROM dbo.Country"))
            .ReturnsTable(_ => ++countryLookups == 1 ? MockTable.Empty() : GuidTable(countryId));
        conn.Mocks.When(cmd => cmd.CommandText.Contains("SELECT 1 FROM dbo.Country"))
            .ReturnsTable(MockTable.Empty());
        conn.Mocks.When(cmd => cmd.CommandText.Contains("INSERT INTO dbo.Country")).ReturnsScalar(1);

        int stateLookups = 0;
        conn.Mocks.When(cmd => cmd.CommandText.Contains("SELECT StateProvinceID FROM dbo.StateProvince"))
            .ReturnsTable(_ => ++stateLookups == 1 ? MockTable.Empty() : GuidTable(stateProvinceId));
        conn.Mocks.When(cmd => cmd.CommandText.Contains("SELECT 1 FROM dbo.StateProvince"))
            .ReturnsTable(MockTable.Empty());
        conn.Mocks.When(cmd => cmd.CommandText.Contains("INSERT INTO dbo.StateProvince"))
            .ReturnsScalar(1);

        int cityLookups = 0;
        conn.Mocks.When(cmd => cmd.CommandText.Contains("FROM dbo.City c"))
            .ReturnsTable(_ => ++cityLookups == 1 ? MockTable.Empty() : GuidTable(cityId));
        conn.Mocks.When(cmd => cmd.CommandText.Contains("SELECT 1 FROM dbo.City"))
            .ReturnsTable(MockTable.Empty());
        conn.Mocks.When(cmd => cmd.CommandText.Contains("INSERT INTO dbo.City")).ReturnsScalar(1);

        LocationRepository repo = CreateRepo(conn);
        Guid result = await repo.GetOrCreateCityIdAsync(Location);

        result.Should().Be(cityId);
    }

    [Fact]
    public async Task GetOrCreateCityIdAsync_ThrowsNotFound_WhenCountryMissingForNewStateProvince()
    {
        MockDbConnection conn = new();

        // Country never resolves, even after the (mocked) insert -- simulates a race where the
        // country is missing by the time the state/province lookup runs.
        conn.Mocks.When(cmd => cmd.CommandText.Contains("SELECT CountryID FROM dbo.Country"))
            .ReturnsTable(MockTable.Empty());
        conn.Mocks.When(cmd => cmd.CommandText.Contains("SELECT 1 FROM dbo.Country"))
            .ReturnsTable(MockTable.Empty());
        conn.Mocks.When(cmd => cmd.CommandText.Contains("INSERT INTO dbo.Country")).ReturnsScalar(1);

        conn.Mocks.When(cmd => cmd.CommandText.Contains("SELECT StateProvinceID FROM dbo.StateProvince"))
            .ReturnsTable(MockTable.Empty());

        LocationRepository repo = CreateRepo(conn);

        Func<Task> act = async () => await repo.GetOrCreateCityIdAsync(Location);
        await act.Should().ThrowAsync<NotFoundException>();
    }
}
