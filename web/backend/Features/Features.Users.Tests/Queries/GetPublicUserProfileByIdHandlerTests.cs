using Domain.Entities;
using Domain.Exceptions;
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

    public GetPublicUserProfileByIdHandlerTests()
    {
        _handler = new GetPublicUserProfileByIdHandler(_repoMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsPublicProfile_WhenFound()
    {
        UserAccount user = new()
        {
            UserAccountId = Guid.NewGuid(),
            Username = "test",
            FirstName = "Jane",
            LastName = "Doe",
            Email = "jane@example.com",
            DateOfBirth = new DateTime(1990, 1, 1),
            CreatedAt = new DateTime(2024, 1, 1),
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
                    user.CreatedAt
                )
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
