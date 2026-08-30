using Domain.Entities;
using Domain.Exceptions;
using Features.Auth.Queries.GetUserById;
using Features.Auth.Repository;
using FluentAssertions;
using Moq;

namespace Features.Auth.Tests.Queries;

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
            new GetUserByIdQuery(user.UserAccountId),
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
            await _handler.Handle(new GetUserByIdQuery(id), CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }
}
