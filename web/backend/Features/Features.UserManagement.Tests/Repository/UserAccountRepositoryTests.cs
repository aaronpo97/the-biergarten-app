using Apps72.Dev.Data.DbMocker;
using Domain.Entities;
using Domain.Exceptions;
using Features.UserManagement.Repository;
using FluentAssertions;

namespace Features.UserManagement.Tests.Repository;

public class UserAccountRepositoryTests
{
    private static UserAccountRepository CreateRepo(MockDbConnection conn)
    {
        return new UserAccountRepository(new TestConnectionFactory(conn));
    }

    [Fact]
    public async Task GetByIdAsync_ReturnsRow_Mapped()
    {
        MockDbConnection conn = new();
        conn.Mocks.When(cmd => cmd.CommandText.Contains("WHERE UserAccountID = @UserAccountId"))
            .ReturnsTable(
                MockTable
                    .WithColumns(
                        ("UserAccountId", typeof(Guid)),
                        ("Username", typeof(string)),
                        ("FirstName", typeof(string)),
                        ("LastName", typeof(string)),
                        ("Email", typeof(string)),
                        ("CreatedAt", typeof(DateTime)),
                        ("UpdatedAt", typeof(DateTime?)),
                        ("DateOfBirth", typeof(DateTime)),
                        ("Timer", typeof(byte[]))
                    )
                    .AddRow(
                        Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
                        "yerb",
                        "Aaron",
                        "Po",
                        "aaronpo@example.com",
                        new DateTime(2020, 1, 1),
                        null,
                        new DateTime(1990, 1, 1),
                        null
                    )
            );

        UserAccountRepository repo = CreateRepo(conn);
        UserAccount? result = await repo.GetByIdAsync(
            Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
        );

        result.Should().NotBeNull();
        result!.Username.Should().Be("yerb");
        result.Email.Should().Be("aaronpo@example.com");
    }

    [Fact]
    public async Task GetAllAsync_ReturnsMultipleRows()
    {
        MockDbConnection conn = new();
        conn.Mocks.When(cmd => cmd.CommandText.Contains("OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY"))
            .ReturnsTable(
                MockTable
                    .WithColumns(
                        ("UserAccountId", typeof(Guid)),
                        ("Username", typeof(string)),
                        ("FirstName", typeof(string)),
                        ("LastName", typeof(string)),
                        ("Email", typeof(string)),
                        ("CreatedAt", typeof(DateTime)),
                        ("UpdatedAt", typeof(DateTime?)),
                        ("DateOfBirth", typeof(DateTime)),
                        ("Timer", typeof(byte[]))
                    )
                    .AddRow(
                        Guid.NewGuid(),
                        "a",
                        "A",
                        "A",
                        "a@example.com",
                        DateTime.UtcNow,
                        null,
                        DateTime.UtcNow.Date,
                        null
                    )
                    .AddRow(
                        Guid.NewGuid(),
                        "b",
                        "B",
                        "B",
                        "b@example.com",
                        DateTime.UtcNow,
                        null,
                        DateTime.UtcNow.Date,
                        null
                    )
            );

        UserAccountRepository repo = CreateRepo(conn);
        List<UserAccount> results = (await repo.GetAllAsync(null, null)).ToList();
        results.Should().HaveCount(2);
        results.Select(r => r.Username).Should().BeEquivalentTo("a", "b");
    }

    [Fact]
    public async Task GetByUsername_ReturnsRow()
    {
        MockDbConnection conn = new();
        conn.Mocks.When(cmd => cmd.CommandText.Contains("WHERE Username = @Username"))
            .ReturnsTable(
                MockTable
                    .WithColumns(
                        ("UserAccountId", typeof(Guid)),
                        ("Username", typeof(string)),
                        ("FirstName", typeof(string)),
                        ("LastName", typeof(string)),
                        ("Email", typeof(string)),
                        ("CreatedAt", typeof(DateTime)),
                        ("UpdatedAt", typeof(DateTime?)),
                        ("DateOfBirth", typeof(DateTime)),
                        ("Timer", typeof(byte[]))
                    )
                    .AddRow(
                        Guid.NewGuid(),
                        "lookupuser",
                        "L",
                        "U",
                        "lookup@example.com",
                        DateTime.UtcNow,
                        null,
                        DateTime.UtcNow.Date,
                        null
                    )
            );

        UserAccountRepository repo = CreateRepo(conn);
        UserAccount? result = await repo.GetByUsernameAsync("lookupuser");
        result.Should().NotBeNull();
        result!.Email.Should().Be("lookup@example.com");
    }

    [Fact]
    public async Task GetByEmail_ReturnsRow()
    {
        MockDbConnection conn = new();
        conn.Mocks.When(cmd => cmd.CommandText.Contains("WHERE Email = @Email"))
            .ReturnsTable(
                MockTable
                    .WithColumns(
                        ("UserAccountId", typeof(Guid)),
                        ("Username", typeof(string)),
                        ("FirstName", typeof(string)),
                        ("LastName", typeof(string)),
                        ("Email", typeof(string)),
                        ("CreatedAt", typeof(DateTime)),
                        ("UpdatedAt", typeof(DateTime?)),
                        ("DateOfBirth", typeof(DateTime)),
                        ("Timer", typeof(byte[]))
                    )
                    .AddRow(
                        Guid.NewGuid(),
                        "byemail",
                        "B",
                        "E",
                        "byemail@example.com",
                        DateTime.UtcNow,
                        null,
                        DateTime.UtcNow.Date,
                        null
                    )
            );

        UserAccountRepository repo = CreateRepo(conn);
        UserAccount? result = await repo.GetByEmailAsync("byemail@example.com");
        result.Should().NotBeNull();
        result!.Username.Should().Be("byemail");
    }

    [Fact]
    public async Task GetAllAsync_AppliesLimitAndOffset()
    {
        MockDbConnection conn = new();
        conn.Mocks.When(cmd =>
                cmd.CommandText.Contains("OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY")
            )
            .ReturnsTable(MockTable.Empty());

        UserAccountRepository repo = CreateRepo(conn);

        // Fails with a MockException if the repository doesn't emit OFFSET/FETCH pagination SQL.
        await repo.GetAllAsync(10, 20);
    }

    [Fact]
    public async Task UpdateAsync_ThrowsNotFound_WhenAccountMissing()
    {
        MockDbConnection conn = new();
        conn.Mocks.When(cmd => cmd.CommandText.Contains("UPDATE dbo.UserAccount"))
            .ReturnsTable(MockTable.Empty());

        UserAccountRepository repo = CreateRepo(conn);
        UserAccount account = new() { UserAccountId = Guid.NewGuid(), Username = "ghost" };

        Func<Task> act = async () => await repo.UpdateAsync(account);
        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task DeleteAsync_ThrowsNotFound_WhenAccountMissing()
    {
        MockDbConnection conn = new();
        conn.Mocks.When(cmd => cmd.CommandText.Contains("DELETE FROM dbo.UserAccount"))
            .ReturnsTable(MockTable.Empty());

        UserAccountRepository repo = CreateRepo(conn);

        Func<Task> act = async () => await repo.DeleteAsync(Guid.NewGuid());
        await act.Should().ThrowAsync<NotFoundException>();
    }
}
