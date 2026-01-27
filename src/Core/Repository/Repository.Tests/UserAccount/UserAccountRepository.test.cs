using Apps72.Dev.Data.DbMocker;
using DataAccessLayer.Repositories.UserAccount;
using FluentAssertions;
using Repository.Tests.Database;

namespace Repository.Tests.UserAccount;

public class UserAccountRepositoryTest
{
    private static UserAccountRepository CreateRepo(MockDbConnection conn)
        => new(new TestConnectionFactory(conn));

    [Fact]
    public async Task GetByIdAsync_ReturnsRow_Mapped()
    {
        var conn = new MockDbConnection();
        conn.Mocks
            .When(cmd => cmd.CommandText == "usp_GetUserAccountById")
            .ReturnsTable(MockTable.WithColumns(
                ("UserAccountId", typeof(Guid)),
                ("Username", typeof(string)),
                ("FirstName", typeof(string)),
                ("LastName", typeof(string)),
                ("Email", typeof(string)),
                ("CreatedAt", typeof(DateTime)),
                ("UpdatedAt", typeof(DateTime?)),
                ("DateOfBirth", typeof(DateTime)),
                ("Timer", typeof(byte[]))
            ).AddRow(Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                     "yerb","Aaron","Po","aaronpo@example.com",
                     new DateTime(2020,1,1), null,
                     new DateTime(1990,1,1), null));

        var repo = CreateRepo(conn);
        var result = await repo.GetByIdAsync(Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"));

        result.Should().NotBeNull();
        result!.Username.Should().Be("yerb");
        result.Email.Should().Be("aaronpo@example.com");
    }

    [Fact]
    public async Task GetAllAsync_ReturnsMultipleRows()
    {
        var conn = new MockDbConnection();
        conn.Mocks
            .When(cmd => cmd.CommandText == "usp_GetAllUserAccounts")
            .ReturnsTable(MockTable.WithColumns(   
                ("UserAccountId", typeof(Guid)),
                ("Username", typeof(string)),
                ("FirstName", typeof(string)),
                ("LastName", typeof(string)),
                ("Email", typeof(string)),
                ("CreatedAt", typeof(DateTime)),
                ("UpdatedAt", typeof(DateTime?)),
                ("DateOfBirth", typeof(DateTime)),
                ("Timer", typeof(byte[]))
            ).AddRow(Guid.NewGuid(), "a","A","A","a@example.com", DateTime.UtcNow, null, DateTime.UtcNow.Date, null)
             .AddRow(Guid.NewGuid(), "b","B","B","b@example.com", DateTime.UtcNow, null, DateTime.UtcNow.Date, null));

        var repo = CreateRepo(conn);
        var results = (await repo.GetAllAsync(null, null)).ToList();
        results.Should().HaveCount(2);
        results.Select(r => r.Username).Should().BeEquivalentTo(new[] { "a", "b" });
    }

    [Fact]
    public async Task AddAsync_ExecutesStoredProcedure()
    {
        var conn = new MockDbConnection();
        conn.Mocks
            .When(cmd => cmd.CommandText == "usp_CreateUserAccount")
            .ReturnsScalar(1);

        var repo = CreateRepo(conn);
        var user = new DataAccessLayer.Entities.UserAccount
        {
            UserAccountId = Guid.NewGuid(),
            Username = "newuser",
            FirstName = "New",
            LastName = "User",
            Email = "newuser@example.com",
            DateOfBirth = new DateTime(1991,1,1)
        };

        await repo.AddAsync(user);
    }

    [Fact]
    public async Task GetByUsername_ReturnsRow()
    {
        var conn = new MockDbConnection();
        conn.Mocks
            .When(cmd => cmd.CommandText == "usp_GetUserAccountByUsername")
            .ReturnsTable(MockTable.WithColumns(
                ("UserAccountId", typeof(Guid)),
                ("Username", typeof(string)),
                ("FirstName", typeof(string)),
                ("LastName", typeof(string)),
                ("Email", typeof(string)),
                ("CreatedAt", typeof(DateTime)),
                ("UpdatedAt", typeof(DateTime?)),
                ("DateOfBirth", typeof(DateTime)),
                ("Timer", typeof(byte[]))
            ).AddRow(Guid.NewGuid(), "lookupuser","L","U","lookup@example.com", DateTime.UtcNow, null, DateTime.UtcNow.Date, null));

        var repo = CreateRepo(conn);
        var result = await repo.GetByUsernameAsync("lookupuser");
        result.Should().NotBeNull();
        result!.Email.Should().Be("lookup@example.com");
    }

    [Fact]
    public async Task GetByEmail_ReturnsRow()
    {
        var conn = new MockDbConnection();
        conn.Mocks
            .When(cmd => cmd.CommandText == "usp_GetUserAccountByEmail")
            .ReturnsTable(MockTable.WithColumns(
                ("UserAccountId", typeof(Guid)),
                ("Username", typeof(string)),
                ("FirstName", typeof(string)),
                ("LastName", typeof(string)),
                ("Email", typeof(string)),
                ("CreatedAt", typeof(DateTime)),
                ("UpdatedAt", typeof(DateTime?)),
                ("DateOfBirth", typeof(DateTime)),
                ("Timer", typeof(byte[]))
            ).AddRow(Guid.NewGuid(), "byemail","B","E","byemail@example.com", DateTime.UtcNow, null, DateTime.UtcNow.Date, null));

        var repo = CreateRepo(conn);
        var result = await repo.GetByEmailAsync("byemail@example.com");
        result.Should().NotBeNull();
        result!.Username.Should().Be("byemail");
    }
}
