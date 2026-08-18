using Apps72.Dev.Data.DbMocker;
using Domain.Entities;
using Features.Auth.Dtos;
using Features.Auth.Repository;
using FluentAssertions;

namespace Features.Auth.Tests.Repository;

public class AuthRepositoryTests
{
    private static AuthRepository CreateRepo(MockDbConnection conn)
    {
        return new AuthRepository(new TestConnectionFactory(conn));
    }

    [Fact]
    public async Task RegisterUserAsync_CreatesUserWithCredential_ReturnsUserAccount()
    {
        Guid expectedUserId = Guid.NewGuid();
        MockDbConnection conn = new();

        // DbMocker's ReturnsScalar(Guid) doesn't round-trip correctly, so a single-row/single-column
        // ReturnsTable is used to fake the scalar OUTPUT INSERTED.UserAccountID read instead.
        conn.Mocks.When(cmd => cmd.CommandText.Contains("INSERT INTO dbo.UserAccount"))
            .ReturnsTable(
                MockTable.WithColumns(("UserAccountID", typeof(Guid))).AddRow(expectedUserId)
            );

        conn.Mocks.When(cmd => cmd.CommandText.Contains("INSERT INTO dbo.UserCredential"))
            .ReturnsScalar(1);

        // Mock the subsequent read for the newly created user by id
        conn.Mocks.When(cmd =>
                cmd.CommandText.Contains("FROM dbo.UserAccount")
                && cmd.CommandText.Contains("WHERE UserAccountID")
            )
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
                        expectedUserId,
                        "testuser",
                        "Test",
                        "User",
                        "test@example.com",
                        DateTime.UtcNow,
                        null,
                        new DateTime(1990, 1, 1),
                        null
                    )
            );

        AuthRepository repo = CreateRepo(conn);
        UserAccount result = await repo.RegisterUserAsync(
            new UserRegistrationDto(
                "testuser",
                "Test",
                "User",
                "test@example.com",
                new DateTime(1990, 1, 1),
                "hashedpassword123"
            )
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
        Guid userId = Guid.NewGuid();
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
                        userId,
                        "emailuser",
                        "Email",
                        "User",
                        "emailuser@example.com",
                        DateTime.UtcNow,
                        null,
                        new DateTime(1990, 5, 15),
                        null
                    )
            );

        AuthRepository repo = CreateRepo(conn);
        UserAccount? result = await repo.GetUserByEmailAsync("emailuser@example.com");

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
        MockDbConnection conn = new();

        conn.Mocks.When(cmd => cmd.CommandText.Contains("WHERE Email = @Email"))
            .ReturnsTable(MockTable.Empty());

        AuthRepository repo = CreateRepo(conn);
        UserAccount? result = await repo.GetUserByEmailAsync("nonexistent@example.com");

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetUserByUsernameAsync_ReturnsUser_WhenExists()
    {
        Guid userId = Guid.NewGuid();
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
                        userId,
                        "usernameuser",
                        "Username",
                        "User",
                        "username@example.com",
                        DateTime.UtcNow,
                        null,
                        new DateTime(1985, 8, 20),
                        null
                    )
            );

        AuthRepository repo = CreateRepo(conn);
        UserAccount? result = await repo.GetUserByUsernameAsync("usernameuser");

        result.Should().NotBeNull();
        result!.UserAccountId.Should().Be(userId);
        result.Username.Should().Be("usernameuser");
        result.Email.Should().Be("username@example.com");
    }

    [Fact]
    public async Task GetUserByUsernameAsync_ReturnsNull_WhenNotExists()
    {
        MockDbConnection conn = new();

        conn.Mocks.When(cmd => cmd.CommandText.Contains("WHERE Username = @Username"))
            .ReturnsTable(MockTable.Empty());

        AuthRepository repo = CreateRepo(conn);
        UserAccount? result = await repo.GetUserByUsernameAsync("nonexistent");

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetActiveCredentialByUserAccountIdAsync_ReturnsCredential_WhenExists()
    {
        Guid userId = Guid.NewGuid();
        Guid credentialId = Guid.NewGuid();
        MockDbConnection conn = new();

        conn.Mocks.When(cmd => cmd.CommandText.Contains("FROM dbo.UserCredential"))
            .ReturnsTable(
                MockTable
                    .WithColumns(
                        ("UserCredentialId", typeof(Guid)),
                        ("UserAccountId", typeof(Guid)),
                        ("Hash", typeof(string)),
                        ("CreatedAt", typeof(DateTime)),
                        ("Timer", typeof(byte[]))
                    )
                    .AddRow(credentialId, userId, "hashed_password_value", DateTime.UtcNow, null)
            );

        AuthRepository repo = CreateRepo(conn);
        UserCredential? result = await repo.GetActiveCredentialByUserAccountIdAsync(userId);

        result.Should().NotBeNull();
        result!.UserCredentialId.Should().Be(credentialId);
        result.UserAccountId.Should().Be(userId);
        result.Hash.Should().Be("hashed_password_value");
    }

    [Fact]
    public async Task GetActiveCredentialByUserAccountIdAsync_ReturnsNull_WhenNotExists()
    {
        Guid userId = Guid.NewGuid();
        MockDbConnection conn = new();

        conn.Mocks.When(cmd => cmd.CommandText.Contains("FROM dbo.UserCredential"))
            .ReturnsTable(MockTable.Empty());

        AuthRepository repo = CreateRepo(conn);
        UserCredential? result = await repo.GetActiveCredentialByUserAccountIdAsync(userId);

        result.Should().BeNull();
    }

    [Fact]
    public async Task RotateCredentialAsync_ExecutesSuccessfully()
    {
        Guid userId = Guid.NewGuid();
        string newPasswordHash = "new_hashed_password";
        MockDbConnection conn = new();

        conn.Mocks.When(cmd => cmd.CommandText.Contains("SELECT 1 FROM dbo.UserAccount"))
            .ReturnsScalar(1);
        conn.Mocks.When(cmd => cmd.CommandText.Contains("UPDATE dbo.UserCredential")).ReturnsScalar(1);
        conn.Mocks.When(cmd => cmd.CommandText.Contains("INSERT INTO dbo.UserCredential"))
            .ReturnsScalar(1);

        AuthRepository repo = CreateRepo(conn);

        // Should not throw
        Func<Task> act = async () => await repo.RotateCredentialAsync(userId, newPasswordHash);
        await act.Should().NotThrowAsync();
    }

    [Fact]
    public async Task RotateCredentialAsync_ThrowsNotFound_WhenUserAccountMissing()
    {
        MockDbConnection conn = new();

        conn.Mocks.When(cmd => cmd.CommandText.Contains("SELECT 1 FROM dbo.UserAccount"))
            .ReturnsTable(MockTable.Empty());

        AuthRepository repo = CreateRepo(conn);

        Func<Task> act = async () => await repo.RotateCredentialAsync(Guid.NewGuid(), "hash");
        await act.Should().ThrowAsync<Domain.Exceptions.NotFoundException>();
    }
}
