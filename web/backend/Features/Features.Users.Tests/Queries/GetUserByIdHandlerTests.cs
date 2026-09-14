using Domain.Entities;
using Domain.Exceptions;
using Features.Users.Queries.GetUserById;
using Features.Users.Repository;
using FluentAssertions;
using Moq;

namespace Features.Users.Tests.Queries;

public class GetUserByIdHandlerTests
{
    private readonly GetUserByIdHandler _handler;
    private readonly Mock<IUserListRepository> _repoMock = new();

    public GetUserByIdHandlerTests()
    {
        _handler = new GetUserByIdHandler(_repoMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsUser_WhenFound()
    {
        UserAccount user = new() { UserAccountId = Guid.NewGuid(), Username = "test" };
        _repoMock.Setup(r => r.GetByIdAsync(user.UserAccountId)).ReturnsAsync(user);

        UserAccount result = await _handler.Handle(
            new GetUserByIdQuery(user.UserAccountId, user.UserAccountId),
            CancellationToken.None
        );

        result.Should().Be(user);
    }

    [Fact]
    public async Task Handle_Throws_WhenNotFound()
    {
        Guid id = Guid.NewGuid();
        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync((UserAccount?)null);

        Func<Task<UserAccount>> act = async () =>
            await _handler.Handle(new GetUserByIdQuery(id, id), CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task Handle_Throws_WhenRequestingSomeoneElsesAccount()
    {
        Guid id = Guid.NewGuid();
        Guid requestingUserId = Guid.NewGuid();

        Func<Task<UserAccount>> act = async () =>
            await _handler.Handle(new GetUserByIdQuery(id, requestingUserId), CancellationToken.None);

        await act.Should().ThrowAsync<ForbiddenException>();
        _repoMock.Verify(r => r.GetByIdAsync(It.IsAny<Guid>()), Times.Never);
    }
}
