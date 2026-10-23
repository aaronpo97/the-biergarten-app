using Domain.Exceptions;
using Features.Users.Commands.Follows.FollowUser;
using Features.Users.Identity;
using Features.Users.Repository;
using Features.Users.Tests.TestSupport;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Moq;

namespace Features.Users.Tests.Commands;

public class FollowUserHandlerTests
{
    private readonly FollowUserHandler _handler;
    private readonly Mock<IUserFollowRepository> _followRepoMock = new();
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;

    public FollowUserHandlerTests()
    {
        _userManagerMock = UserManagerMockFactory.Create();
        _handler = new FollowUserHandler(_userManagerMock.Object, _followRepoMock.Object);
    }

    [Fact]
    public async Task Handle_WithExistingTarget_RecordsTheFollow()
    {
        Guid followerId = Guid.NewGuid();
        Guid followingId = Guid.NewGuid();
        _userManagerMock
            .Setup(x => x.FindByIdAsync(followingId.ToString()))
            .ReturnsAsync(new ApplicationUser { Id = followingId });

        await _handler.Handle(
            new FollowUserCommand(followerId, followingId),
            CancellationToken.None
        );

        _followRepoMock.Verify(
            r => r.FollowAsync(followerId, followingId, It.IsAny<CancellationToken>()),
            Times.Once
        );
    }

    [Fact]
    public async Task Handle_WhenRepeated_SucceedsEachTime()
    {
        Guid followerId = Guid.NewGuid();
        Guid followingId = Guid.NewGuid();
        _userManagerMock
            .Setup(x => x.FindByIdAsync(followingId.ToString()))
            .ReturnsAsync(new ApplicationUser { Id = followingId });

        await _handler.Handle(
            new FollowUserCommand(followerId, followingId),
            CancellationToken.None
        );
        Func<Task> act = async () =>
            await _handler.Handle(
                new FollowUserCommand(followerId, followingId),
                CancellationToken.None
            );

        await act.Should().NotThrowAsync();
        _followRepoMock.Verify(
            r => r.FollowAsync(followerId, followingId, It.IsAny<CancellationToken>()),
            Times.Exactly(2)
        );
    }

    [Fact]
    public async Task Handle_WhenFollowingSelf_ThrowsValidationException()
    {
        Guid userId = Guid.NewGuid();

        Func<Task> act = async () =>
            await _handler.Handle(new FollowUserCommand(userId, userId), CancellationToken.None);

        await act.Should().ThrowAsync<ValidationException>();
        _followRepoMock.Verify(
            r => r.FollowAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()),
            Times.Never
        );
    }

    [Fact]
    public async Task Handle_WithUnknownTarget_ThrowsNotFoundException()
    {
        Guid followingId = Guid.NewGuid();
        _userManagerMock
            .Setup(x => x.FindByIdAsync(followingId.ToString()))
            .ReturnsAsync((ApplicationUser?)null);

        Func<Task> act = async () =>
            await _handler.Handle(
                new FollowUserCommand(Guid.NewGuid(), followingId),
                CancellationToken.None
            );

        await act.Should().ThrowAsync<NotFoundException>();
        _followRepoMock.Verify(
            r => r.FollowAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<CancellationToken>()),
            Times.Never
        );
    }
}
