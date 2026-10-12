using Domain.Entities;
using Features.ImageUploads.Services;
using Features.Users.Dtos;
using Features.Users.Queries.GetAllUsers;
using Features.Users.Repository;
using FluentAssertions;
using Moq;

namespace Features.Users.Tests.Queries;

public class GetAllUsersHandlerTests
{
    private readonly Mock<IUserListRepository> _repoMock = new();
    private readonly Mock<IFileStorageProvider> _storageMock = new();
    private readonly GetAllUsersHandler _handler;

    public GetAllUsersHandlerTests()
    {
        _storageMock
            .Setup(s => s.GetPresignedUrl(It.IsAny<string>(), It.IsAny<TimeSpan>()))
            .Returns((string key, TimeSpan _) => $"https://storage.test/{key}?signed");

        _handler = new GetAllUsersHandler(_repoMock.Object, _storageMock.Object);
    }

    [Fact]
    public async Task Handle_PassesLimitAndOffset_ToRepository()
    {
        _repoMock.Setup(r => r.GetAllAsync(10, 5)).ReturnsAsync(Array.Empty<UserAccount>());

        IEnumerable<PublicUserProfileDto> result = await _handler.Handle(
            new GetAllUsersQuery(10, 5),
            CancellationToken.None
        );

        result.Should().BeEmpty();
        _repoMock.Verify(r => r.GetAllAsync(10, 5), Times.Once);
    }

    [Fact]
    public async Task Handle_MapsUsersToPublicProfileDtos_AndExcludesPrivateFields()
    {
        UserAccount user = new()
        {
            UserAccountId = Guid.NewGuid(),
            Username = "someone",
            FirstName = "Some",
            LastName = "One",
            CreatedAt = DateTime.UtcNow,
        };
        _repoMock.Setup(r => r.GetAllAsync(null, null)).ReturnsAsync([user]);

        IEnumerable<PublicUserProfileDto> result = await _handler.Handle(
            new GetAllUsersQuery(null, null),
            CancellationToken.None
        );

        result
            .Should()
            .ContainSingle()
            .Which.Should()
            .BeEquivalentTo(user.ToPublicProfileDto(_storageMock.Object));
    }

    [Fact]
    public async Task Handle_MapsEachUsersOwnAvatarUrl()
    {
        string avatarKey = $"avatars/{Guid.NewGuid()}/{Guid.NewGuid()}";
        UserAccount withAvatar = new()
        {
            UserAccountId = Guid.NewGuid(),
            Username = "has-avatar",
            FirstName = "Has",
            LastName = "Avatar",
            CreatedAt = DateTime.UtcNow,
            UserProfile = new UserProfile { Biography = "Drinks lagers." },
            UserAvatar = new UserAvatar { Photo = new Photo { Hyperlink = avatarKey } },
        };
        UserAccount withoutAvatar = new()
        {
            UserAccountId = Guid.NewGuid(),
            Username = "no-avatar",
            FirstName = "No",
            LastName = "Avatar",
            CreatedAt = DateTime.UtcNow,
        };
        _repoMock.Setup(r => r.GetAllAsync(null, null)).ReturnsAsync([withAvatar, withoutAvatar]);

        IEnumerable<PublicUserProfileDto> result = await _handler.Handle(
            new GetAllUsersQuery(null, null),
            CancellationToken.None
        );

        result
            .Select(dto => dto.AvatarUrl)
            .Should()
            .Equal($"https://storage.test/{avatarKey}?signed", string.Empty);
        _storageMock.Verify(
            s => s.GetPresignedUrl(avatarKey, UserDtoMapper.AvatarUrlLifetime),
            Times.Once
        );
        _storageMock.Verify(
            s => s.GetPresignedUrl(It.IsAny<string>(), It.IsAny<TimeSpan>()),
            Times.Once
        );
    }
}
