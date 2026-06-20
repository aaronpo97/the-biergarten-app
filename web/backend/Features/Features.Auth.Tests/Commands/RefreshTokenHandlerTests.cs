using Domain.Entities;
using FluentAssertions;
using Features.Auth.Commands.RefreshToken;
using Features.Auth.Services;
using Moq;

namespace Features.Auth.Tests.Commands;

public class RefreshTokenHandlerTests
{
    [Fact]
    public async Task Handle_MapsTokenServiceResult_ToLoginPayload()
    {
        var tokenServiceMock = new Mock<ITokenService>();
        var handler = new RefreshTokenHandler(tokenServiceMock.Object);
        var userId = Guid.NewGuid();
        var user = new UserAccount { UserAccountId = userId, Username = "testuser" };

        tokenServiceMock
            .Setup(x => x.RefreshTokenAsync("old-refresh-token"))
            .ReturnsAsync(new RefreshTokenResult(user, "new-refresh-token", "new-access-token"));

        var result = await handler.Handle(new RefreshTokenCommand("old-refresh-token"), CancellationToken.None);

        result.UserAccountId.Should().Be(userId);
        result.Username.Should().Be("testuser");
        result.RefreshToken.Should().Be("new-refresh-token");
        result.AccessToken.Should().Be("new-access-token");
    }
}
