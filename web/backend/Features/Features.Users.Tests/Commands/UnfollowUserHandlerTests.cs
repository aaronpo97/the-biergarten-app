using Features.Users.Commands.Follows.UnfollowUser;
using Features.Users.Repository;
using FluentAssertions;
using Moq;

namespace Features.Users.Tests.Commands;

public class UnfollowUserHandlerTests
{
    private readonly UnfollowUserHandler _handler;
    private readonly Mock<IUserFollowRepository> _followRepoMock = new();

    public UnfollowUserHandlerTests()
    {
        _handler = new UnfollowUserHandler(_followRepoMock.Object);
    }

    [Fact]
    public async Task Handle_RemovesTheFollow()
    {
        Guid followerId = Guid.NewGuid();
        Guid followingId = Guid.NewGuid();

        await _handler.Handle(
            new UnfollowUserCommand(followerId, followingId),
            CancellationToken.None
        );

        _followRepoMock.Verify(
            r => r.UnfollowAsync(followerId, followingId, It.IsAny<CancellationToken>()),
            Times.Once
        );
    }

    [Fact]
    public async Task Handle_WhenNotFollowing_Completes()
    {
        _followRepoMock
            .Setup(r =>
                r.UnfollowAsync(
                    It.IsAny<Guid>(),
                    It.IsAny<Guid>(),
                    It.IsAny<CancellationToken>()
                )
            )
            .Returns(Task.CompletedTask);

        Task handling = _handler.Handle(
            new UnfollowUserCommand(Guid.NewGuid(), Guid.NewGuid()),
            CancellationToken.None
        );

        await handling;
        handling.IsCompletedSuccessfully.Should().BeTrue();
    }
}
