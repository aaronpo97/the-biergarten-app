using Domain.Entities;
using Features.Users.Dtos;
using Features.Users.Queries.GetAllUsers;
using Features.Users.Repository;
using FluentAssertions;
using Moq;

namespace Features.Users.Tests.Queries;

public class GetAllUsersHandlerTests
{
    [Fact]
    public async Task Handle_PassesLimitAndOffset_ToRepository()
    {
        Mock<IUserListRepository> repoMock = new();
        GetAllUsersHandler handler = new(repoMock.Object);
        repoMock.Setup(r => r.GetAllAsync(10, 5)).ReturnsAsync(Array.Empty<UserAccount>());

        IEnumerable<PublicUserProfileDto> result = await handler.Handle(
            new GetAllUsersQuery(10, 5),
            CancellationToken.None
        );

        result.Should().BeEmpty();
        repoMock.Verify(r => r.GetAllAsync(10, 5), Times.Once);
    }

    [Fact]
    public async Task Handle_MapsUsersToPublicProfileDtos_AndExcludesPrivateFields()
    {
        Mock<IUserListRepository> repoMock = new();
        GetAllUsersHandler handler = new(repoMock.Object);
        UserAccount user = new()
        {
            UserAccountId = Guid.NewGuid(),
            Username = "someone",
            FirstName = "Some",
            LastName = "One",
            CreatedAt = DateTime.UtcNow,
        };
        repoMock.Setup(r => r.GetAllAsync(null, null)).ReturnsAsync([user]);

        IEnumerable<PublicUserProfileDto> result = await handler.Handle(
            new GetAllUsersQuery(null, null),
            CancellationToken.None
        );

        result.Should().ContainSingle().Which.Should().BeEquivalentTo(user.ToPublicProfileDto());
    }

    [Fact]
    public async Task Handle_MapsEachUsersOwnAvatarUrl()
    {
        Mock<IUserListRepository> repoMock = new();
        GetAllUsersHandler handler = new(repoMock.Object);
        UserAccount withAvatar = new()
        {
            UserAccountId = Guid.NewGuid(),
            Username = "has-avatar",
            FirstName = "Has",
            LastName = "Avatar",
            CreatedAt = DateTime.UtcNow,
            UserProfile = new UserProfile { Biography = "Drinks lagers." },
            UserAvatar = new UserAvatar
            {
                Photo = new Photo { Hyperlink = "https://cdn.example.com/avatar.jpg" },
            },
        };
        UserAccount withoutAvatar = new()
        {
            UserAccountId = Guid.NewGuid(),
            Username = "no-avatar",
            FirstName = "No",
            LastName = "Avatar",
            CreatedAt = DateTime.UtcNow,
        };
        repoMock.Setup(r => r.GetAllAsync(null, null)).ReturnsAsync([withAvatar, withoutAvatar]);

        IEnumerable<PublicUserProfileDto> result = await handler.Handle(
            new GetAllUsersQuery(null, null),
            CancellationToken.None
        );

        result
            .Select(dto => dto.AvatarUrl)
            .Should()
            .Equal("https://cdn.example.com/avatar.jpg", string.Empty);
    }
}
