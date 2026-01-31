using Apps72.Dev.Data.DbMocker;
using DataAccessLayer.Repositories.UserCredential;
using Repository.Tests.Database;

namespace Repository.Tests.UserCredential;

public class UserCredentialRepositoryTests
{
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