using Apps72.Dev.Data.DbMocker;
using Repository.Core.Repositories.Auth;
using FluentAssertions;
using Repository.Tests.Database;
using System.Data;

namespace Repository.Tests.Auth;

public class AuthRepositoryTest
{
    private static AuthRepository CreateRepo(MockDbConnection conn)
        => new(new TestConnectionFactory(conn));

    [Fact]
    public async Task RegisterUserAsync_CreatesUserWithCredential_ReturnsUserAccount()
    {
        var expectedUserId = Guid.NewGuid();
        var conn = new MockDbConnection();

        conn.Mocks
            .When(cmd => cmd.CommandText == "USP_RegisterUser")
            .ReturnsTable(MockTable.WithColumns(("UserAccountId", typeof(Guid)))
                .AddRow(expectedUserId));

        var repo = CreateRepo(conn);
        var result = await repo.RegisterUserAsync(
            username: "testuser",
            firstName: "Test",
            lastName: "User",
            email: "test@example.com",
            dateOfBirth: new DateTime(1990, 1, 1),
            passwordHash: "hashedpassword123"
        );

        result.Should().NotBeNull();
        result.UserAccountId.Should().Be(expectedUserId);
        result.Username.Should().Be("testuser");
        result.FirstName.Should().Be("Test");
        result.LastName.Should().Be("User");
        result.Email.Should().Be("test@example.com");
        result.DateOfBirth.Should().Be(new DateTime(1990, 1, 1));
    }

    [Fact]
    public async Task GetUserByEmailAsync_ReturnsUser_WhenExists()
    {
        var userId = Guid.NewGuid();
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
            ).AddRow(
                userId,
                "emailuser",
                "Email",
                "User",
                "emailuser@example.com",
                DateTime.UtcNow,
                null,
                new DateTime(1990, 5, 15),
                null
            ));

        var repo = CreateRepo(conn);
        var result = await repo.GetUserByEmailAsync("emailuser@example.com");

        result.Should().NotBeNull();
        result!.UserAccountId.Should().Be(userId);
        result.Username.Should().Be("emailuser");
        result.Email.Should().Be("emailuser@example.com");
        result.FirstName.Should().Be("Email");
        result.LastName.Should().Be("User");
    }

    [Fact]
    public async Task GetUserByEmailAsync_ReturnsNull_WhenNotExists()
    {
        var conn = new MockDbConnection();

        conn.Mocks
            .When(cmd => cmd.CommandText == "usp_GetUserAccountByEmail")
            .ReturnsTable(MockTable.Empty());

        var repo = CreateRepo(conn);
        var result = await repo.GetUserByEmailAsync("nonexistent@example.com");

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetUserByUsernameAsync_ReturnsUser_WhenExists()
    {
        var userId = Guid.NewGuid();
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
            ).AddRow(
                userId,
                "usernameuser",
                "Username",
                "User",
                "username@example.com",
                DateTime.UtcNow,
                null,
                new DateTime(1985, 8, 20),
                null
            ));

        var repo = CreateRepo(conn);
        var result = await repo.GetUserByUsernameAsync("usernameuser");

        result.Should().NotBeNull();
        result!.UserAccountId.Should().Be(userId);
        result.Username.Should().Be("usernameuser");
        result.Email.Should().Be("username@example.com");
    }

    [Fact]
    public async Task GetUserByUsernameAsync_ReturnsNull_WhenNotExists()
    {
        var conn = new MockDbConnection();

        conn.Mocks
            .When(cmd => cmd.CommandText == "usp_GetUserAccountByUsername")
            .ReturnsTable(MockTable.Empty());

        var repo = CreateRepo(conn);
        var result = await repo.GetUserByUsernameAsync("nonexistent");

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetActiveCredentialByUserAccountIdAsync_ReturnsCredential_WhenExists()
    {
        var userId = Guid.NewGuid();
        var credentialId = Guid.NewGuid();
        var conn = new MockDbConnection();

        conn.Mocks
            .When(cmd => cmd.CommandText == "USP_GetActiveUserCredentialByUserAccountId")
            .ReturnsTable(MockTable.WithColumns(
                ("UserCredentialId", typeof(Guid)),
                ("UserAccountId", typeof(Guid)),
                ("Hash", typeof(string)),
                ("CreatedAt", typeof(DateTime)),
                ("Timer", typeof(byte[]))
            ).AddRow(
                credentialId,
                userId,
                "hashed_password_value",
                DateTime.UtcNow,
                null
            ));

        var repo = CreateRepo(conn);
        var result = await repo.GetActiveCredentialByUserAccountIdAsync(userId);

        result.Should().NotBeNull();
        result!.UserCredentialId.Should().Be(credentialId);
        result.UserAccountId.Should().Be(userId);
        result.Hash.Should().Be("hashed_password_value");
    }

    [Fact]
    public async Task GetActiveCredentialByUserAccountIdAsync_ReturnsNull_WhenNotExists()
    {
        var userId = Guid.NewGuid();
        var conn = new MockDbConnection();

        conn.Mocks
            .When(cmd => cmd.CommandText == "USP_GetActiveUserCredentialByUserAccountId")
            .ReturnsTable(MockTable.Empty());

        var repo = CreateRepo(conn);
        var result = await repo.GetActiveCredentialByUserAccountIdAsync(userId);

        result.Should().BeNull();
    }

    [Fact]
    public async Task RotateCredentialAsync_ExecutesSuccessfully()
    {
        var userId = Guid.NewGuid();
        var newPasswordHash = "new_hashed_password";
        var conn = new MockDbConnection();

        conn.Mocks
            .When(cmd => cmd.CommandText == "USP_RotateUserCredential")
            .ReturnsScalar(1);

        var repo = CreateRepo(conn);

        // Should not throw
        var act = async () => await repo.RotateCredentialAsync(userId, newPasswordHash);
        await act.Should().NotThrowAsync();
    }
}
