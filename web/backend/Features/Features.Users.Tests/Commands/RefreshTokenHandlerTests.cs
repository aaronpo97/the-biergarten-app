using Features.Users.Commands.Authentication.RefreshToken;
using Features.Users.Dtos;
using Features.Users.Services;
using FluentAssertions;
using Moq;

namespace Features.Users.Tests.Commands;

public class RefreshTokenHandlerTests
{
    [Fact]
    public async Task Handle_MapsTokenServiceResult_ToLoginPayload()
    {
        Mock<ITokenService> tokenServiceMock = new();
        RefreshTokenHandler handler = new(tokenServiceMock.Object);
        Guid userId = Guid.NewGuid();

        tokenServiceMock
            .Setup(x => x.RefreshTokenAsync("old-refresh-token"))
            .ReturnsAsync(
                new RefreshTokenResult(userId, "testuser", "new-refresh-token", "new-access-token")
            );

        LoginPayload result = await handler.Handle(
            new RefreshTokenCommand("old-refresh-token"),
            CancellationToken.None
        );

        result.UserAccountId.Should().Be(userId);
        result.Username.Should().Be("testuser");
        result.RefreshToken.Should().Be("new-refresh-token");
        result.AccessToken.Should().Be("new-access-token");
    }
}
