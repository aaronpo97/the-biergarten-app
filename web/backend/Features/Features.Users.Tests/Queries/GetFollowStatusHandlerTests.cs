using Features.Users.Dtos;
using Features.Users.Queries.GetFollowStatus;
using Features.Users.Repository;
using FluentAssertions;
using Moq;

namespace Features.Users.Tests.Queries;

public class GetFollowStatusHandlerTests
{
    private readonly GetFollowStatusHandler _handler;
    private readonly Mock<IUserFollowRepository> _followRepoMock = new();

    public GetFollowStatusHandlerTests()
    {
        _handler = new GetFollowStatusHandler(_followRepoMock.Object);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public async Task Handle_ReturnsWhetherTheViewerFollowsTheUser(bool isFollowing)
    {
        Guid viewerId = Guid.NewGuid();
        Guid userId = Guid.NewGuid();
        _followRepoMock
            .Setup(r => r.IsFollowingAsync(viewerId, userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(isFollowing);

        FollowStatusDto result = await _handler.Handle(
            new GetFollowStatusQuery(viewerId, userId),
            CancellationToken.None
        );

        result.IsFollowing.Should().Be(isFollowing);
    }
}
