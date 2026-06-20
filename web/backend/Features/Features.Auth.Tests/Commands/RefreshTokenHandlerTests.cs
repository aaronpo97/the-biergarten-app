using Domain.Entities;
using Features.Auth.Commands.RefreshToken;
using Features.Auth.Dtos;
using Features.Auth.Services;
using FluentAssertions;
using Moq;

namespace Features.Auth.Tests.Commands;

public class RefreshTokenHandlerTests
{
    [Fact]
    public async Task Handle_MapsTokenServiceResult_ToLoginPayload()
    {
        Mock<ITokenService> tokenServiceMock = new();
        RefreshTokenHandler handler = new(tokenServiceMock.Object);
        Guid userId = Guid.NewGuid();
        UserAccount user = new() { UserAccountId = userId, Username = "testuser" };

        tokenServiceMock
            .Setup(x => x.RefreshTokenAsync("old-refresh-token"))
            .ReturnsAsync(new RefreshTokenResult(user, "new-refresh-token", "new-access-token"));

        LoginPayload result = await handler.Handle(new RefreshTokenCommand("old-refresh-token"), CancellationToken.None);

        result.UserAccountId.Should().Be(userId);
        result.Username.Should().Be("testuser");
        result.RefreshToken.Should().Be("new-refresh-token");
        result.AccessToken.Should().Be("new-access-token");
    }
}