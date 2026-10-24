using Domain.Entities;
using Domain.Exceptions;
using Features.ImageUploads.Services;
using Features.Users.Dtos;
using Features.Users.Queries.GetPublicUserProfileById;
using Features.Users.Repository;
using FluentAssertions;
using Moq;

namespace Features.Users.Tests.Queries;

public class GetPublicUserProfileByIdHandlerTests
{
    private readonly GetPublicUserProfileByIdHandler _handler;
    private readonly Mock<IUserListRepository> _repoMock = new();
    private readonly Mock<IFileStorageProvider> _storageMock = new();

    public GetPublicUserProfileByIdHandlerTests()
    {
        _storageMock
            .Setup(s => s.GetPresignedUrl(It.IsAny<string>(), It.IsAny<TimeSpan>()))
            .Returns((string key, TimeSpan _) => $"https://storage.test/{key}?signed");

        _handler = new GetPublicUserProfileByIdHandler(_repoMock.Object, _storageMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsPublicProfile_WhenFound()
    {
        string avatarKey = $"avatars/{Guid.NewGuid()}/{Guid.NewGuid()}";
        UserAccount user = new()
        {
            UserAccountId = Guid.NewGuid(),
            Username = "test",
            FirstName = "Jane",
            LastName = "Doe",
            Email = "jane@example.com",
            DateOfBirth = new DateTime(1990, 1, 1),
            CreatedAt = new DateTime(2024, 1, 1),
            UserProfile = new UserProfile { Biography = "Drinks lagers." },
            UserAvatar = new UserAvatar { Photo = new Photo { Hyperlink = avatarKey } },
            FollowerCount = 7,
            FollowingCount = 3,
        };
        _repoMock.Setup(r => r.GetByIdAsync(user.UserAccountId)).ReturnsAsync(user);

        PublicUserProfileDto result = await _handler.Handle(
            new GetPublicUserProfileByIdQuery(user.UserAccountId),
            CancellationToken.None
        );

        result
            .Should()
            .Be(
                new PublicUserProfileDto(
                    user.UserAccountId,
                    user.Username,
                    user.FirstName,
                    user.LastName,
                    "Drinks lagers.",
                    $"https://storage.test/{avatarKey}?signed",
                    user.CreatedAt,
                    7,
                    3
                )
            );
    }

    /// <summary>
    ///     <c>Photo.Hyperlink</c> holds an object key, so the DTO has to carry a signed URL rather than
    ///     the stored value: a bare key resolves against the calling page's own origin.
    /// </summary>
    [Fact]
    public async Task Handle_SignsTheAvatarKey_RatherThanReturningIt()
    {
        string avatarKey = $"avatars/{Guid.NewGuid()}/{Guid.NewGuid()}";
        UserAccount user = new()
        {
            UserAccountId = Guid.NewGuid(),
            Username = "test",
            FirstName = "Jane",
            LastName = "Doe",
            CreatedAt = new DateTime(2024, 1, 1),
            UserAvatar = new UserAvatar { Photo = new Photo { Hyperlink = avatarKey } },
        };
        _repoMock.Setup(r => r.GetByIdAsync(user.UserAccountId)).ReturnsAsync(user);

        PublicUserProfileDto result = await _handler.Handle(
            new GetPublicUserProfileByIdQuery(user.UserAccountId),
            CancellationToken.None
        );

        result.AvatarUrl.Should().NotBe(avatarKey);
        Uri.TryCreate(result.AvatarUrl, UriKind.Absolute, out Uri? uri).Should().BeTrue();
        uri!.Scheme.Should().BeOneOf("http", "https");
        uri.AbsolutePath.Should().EndWith(avatarKey);
        _storageMock.Verify(
            s => s.GetPresignedUrl(avatarKey, UserDtoMapper.AvatarUrlLifetime),
            Times.Once
        );
    }

    [Fact]
    public async Task Handle_ReturnsEmptyBiographyAndAvatarUrl_WhenProfileMissing()
    {
        UserAccount user = new()
        {
            UserAccountId = Guid.NewGuid(),
            Username = "test",
            FirstName = "Jane",
            LastName = "Doe",
            CreatedAt = new DateTime(2024, 1, 1),
        };
        _repoMock.Setup(r => r.GetByIdAsync(user.UserAccountId)).ReturnsAsync(user);

        PublicUserProfileDto result = await _handler.Handle(
            new GetPublicUserProfileByIdQuery(user.UserAccountId),
            CancellationToken.None
        );

        result.Biography.Should().BeEmpty();
        result.AvatarUrl.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_ReturnsEmptyAvatarUrl_WhenProfileHasNoAvatar()
    {
        UserAccount user = new()
        {
            UserAccountId = Guid.NewGuid(),
            Username = "test",
            FirstName = "Jane",
            LastName = "Doe",
            CreatedAt = new DateTime(2024, 1, 1),
            UserProfile = new UserProfile { Biography = "Drinks lagers." },
        };
        _repoMock.Setup(r => r.GetByIdAsync(user.UserAccountId)).ReturnsAsync(user);

        PublicUserProfileDto result = await _handler.Handle(
            new GetPublicUserProfileByIdQuery(user.UserAccountId),
            CancellationToken.None
        );

        result.Biography.Should().Be("Drinks lagers.");
        result.AvatarUrl.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_ReturnsEmptyAvatarUrl_WhenAvatarHasNoPhoto()
    {
        UserAccount user = new()
        {
            UserAccountId = Guid.NewGuid(),
            Username = "test",
            FirstName = "Jane",
            LastName = "Doe",
            CreatedAt = new DateTime(2024, 1, 1),
            UserProfile = new UserProfile { Biography = "Drinks lagers." },
            UserAvatar = new UserAvatar(),
        };
        _repoMock.Setup(r => r.GetByIdAsync(user.UserAccountId)).ReturnsAsync(user);

        PublicUserProfileDto result = await _handler.Handle(
            new GetPublicUserProfileByIdQuery(user.UserAccountId),
            CancellationToken.None
        );

        result.AvatarUrl.Should().BeEmpty();
        _storageMock.Verify(
            s => s.GetPresignedUrl(It.IsAny<string>(), It.IsAny<TimeSpan>()),
            Times.Never
        );
    }

    [Fact]
    public async Task Handle_Throws_WhenNotFound()
    {
        Guid id = Guid.NewGuid();
        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync((UserAccount?)null);

        Func<Task<PublicUserProfileDto>> act = async () =>
            await _handler.Handle(new GetPublicUserProfileByIdQuery(id), CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }
}
