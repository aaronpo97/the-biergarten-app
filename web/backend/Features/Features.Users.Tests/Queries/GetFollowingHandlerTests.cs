using Domain.Exceptions;
using Features.ImageUploads.Services;
using Features.Users.Dtos;
using Features.Users.Identity;
using Features.Users.Queries.GetFollowing;
using Features.Users.Repository;
using Features.Users.Tests.TestSupport;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Moq;

namespace Features.Users.Tests.Queries;

public class GetFollowingHandlerTests
{
    private readonly GetFollowingHandler _handler;
    private readonly Mock<IUserListRepository> _repoMock = new();
    private readonly Mock<IFileStorageProvider> _storageMock = new();
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;
    private readonly Guid _userId = Guid.NewGuid();

    public GetFollowingHandlerTests()
    {
        _userManagerMock = UserManagerMockFactory.Create();
        _userManagerMock
            .Setup(x => x.FindByIdAsync(_userId.ToString()))
            .ReturnsAsync(new ApplicationUser { Id = _userId });
        _storageMock
            .Setup(s => s.GetPresignedUrl(It.IsAny<string>(), It.IsAny<TimeSpan>()))
            .Returns((string key, TimeSpan _) => $"https://storage.test/{key}?signed");

        _handler = new GetFollowingHandler(
            _userManagerMock.Object,
            _repoMock.Object,
            _storageMock.Object
        );
    }

    [Fact]
    public async Task Handle_ReturnsFollowedUsersWithSignedAvatars()
    {
        string avatarKey = $"avatars/{Guid.NewGuid()}/{Guid.NewGuid()}";
        FollowedUser withAvatar = new(
            Guid.NewGuid(),
            "bob",
            "Bob",
            "Brewer",
            avatarKey,
            new DateTime(2026, 10, 1)
        );
        FollowedUser withoutAvatar = new(
            Guid.NewGuid(),
            "carol",
            "Carol",
            "Cellar",
            null,
            new DateTime(2026, 9, 1)
        );
        _repoMock
            .Setup(r => r.GetFollowingAsync(_userId, 50, 0))
            .ReturnsAsync([withAvatar, withoutAvatar]);

        IEnumerable<FollowedUserDto> result = await _handler.Handle(
            new GetFollowingQuery(_userId, null, null),
            CancellationToken.None
        );

        result
            .Should()
            .Equal(
                new FollowedUserDto(
                    withAvatar.UserAccountId,
                    "bob",
                    "Bob",
                    "Brewer",
                    $"https://storage.test/{avatarKey}?signed",
                    withAvatar.FollowedAt
                ),
                new FollowedUserDto(
                    withoutAvatar.UserAccountId,
                    "carol",
                    "Carol",
                    "Cellar",
                    string.Empty,
                    withoutAvatar.FollowedAt
                )
            );
    }

    [Fact]
    public async Task Handle_ReturnsAnEmptyList_WhenTheUserFollowsNobody()
    {
        _repoMock.Setup(r => r.GetFollowingAsync(_userId, 50, 0)).ReturnsAsync([]);

        IEnumerable<FollowedUserDto> result = await _handler.Handle(
            new GetFollowingQuery(_userId, null, null),
            CancellationToken.None
        );

        result.Should().BeEmpty();
    }

    [Theory]
    [InlineData(null, null, 50, 0)]
    [InlineData(10, 20, 10, 20)]
    [InlineData(0, -5, 1, 0)]
    [InlineData(1000, 0, 100, 0)]
    public async Task Handle_AppliesPagingBounds(
        int? limit,
        int? offset,
        int expectedLimit,
        int expectedOffset
    )
    {
        _repoMock
            .Setup(r => r.GetFollowingAsync(_userId, expectedLimit, expectedOffset))
            .ReturnsAsync([]);

        await _handler.Handle(
            new GetFollowingQuery(_userId, limit, offset),
            CancellationToken.None
        );

        _repoMock.Verify(r => r.GetFollowingAsync(_userId, expectedLimit, expectedOffset), Times.Once);
    }

    [Fact]
    public async Task Handle_Throws_WhenTheUserDoesNotExist()
    {
        Guid unknownId = Guid.NewGuid();
        _userManagerMock
            .Setup(x => x.FindByIdAsync(unknownId.ToString()))
            .ReturnsAsync((ApplicationUser?)null);

        Func<Task> act = async () =>
            await _handler.Handle(
                new GetFollowingQuery(unknownId, null, null),
                CancellationToken.None
            );

        await act.Should().ThrowAsync<NotFoundException>();
    }
}
