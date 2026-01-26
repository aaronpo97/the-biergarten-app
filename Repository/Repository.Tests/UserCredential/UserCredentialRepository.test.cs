using Apps72.Dev.Data.DbMocker;
using DataAccessLayer.Repositories.UserCredential;
using DataAccessLayer.Sql;
using FluentAssertions;
using Moq;
using Repository.Tests.Database;

namespace Repository.Tests.UserCredential;

public class UserCredentialRepositoryTests
{
    private static UserCredentialRepository CreateRepo()
    {
        var factoryMock = new Mock<ISqlConnectionFactory>(MockBehavior.Strict);
        // NotSupported methods do not use the factory; keep strict to ensure no unexpected calls.
        return new UserCredentialRepository(factoryMock.Object);
    }

    [Fact]
    public async Task AddAsync_ShouldThrow_NotSupported()
    {
        var repo = CreateRepo();
        var act = async () => await repo.AddAsync(new DataAccessLayer.Entities.UserCredential());
        await act.Should().ThrowAsync<NotSupportedException>();
    }

    [Fact]
    public async Task GetAllAsync_ShouldThrow_NotSupported()
    {
        var repo = CreateRepo();
        var act = async () => await repo.GetAllAsync(null, null);
        await act.Should().ThrowAsync<NotSupportedException>();
    }

    [Fact]
    public async Task GetByIdAsync_ShouldThrow_NotSupported()
    {
        var repo = CreateRepo();
        var act = async () => await repo.GetByIdAsync(Guid.NewGuid());
        await act.Should().ThrowAsync<NotSupportedException>();
    }

    [Fact]
    public async Task UpdateAsync_ShouldThrow_NotSupported()
    {
        var repo = CreateRepo();
        var act = async () => await repo.UpdateAsync(new DataAccessLayer.Entities.UserCredential());
        await act.Should().ThrowAsync<NotSupportedException>();
    }

    [Fact]
    public async Task DeleteAsync_ShouldThrow_NotSupported()
    {
        var repo = CreateRepo();
        var act = async () => await repo.DeleteAsync(Guid.NewGuid());
        await act.Should().ThrowAsync<NotSupportedException>();
    }

    [Fact]
    public async Task RotateCredentialAsync_ExecutesWithoutError()
    {
        var conn = new MockDbConnection();
        conn.Mocks
            .When(cmd => cmd.CommandText == "USP_RotateUserCredential")
            .ReturnsRow(0);

        var repo = new UserCredentialRepository(new TestConnectionFactory(conn));
        var credential = new DataAccessLayer.Entities.UserCredential
        {
            Hash = "hashed_password"
        };
        await repo.RotateCredentialAsync(Guid.NewGuid(), credential);

    }
}
