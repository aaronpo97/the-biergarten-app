using Domain.Entities;
using Domain.Exceptions;
using FluentAssertions;
using Features.UserManagement.Queries.GetUserById;
using Features.UserManagement.Repository;
using Moq;

namespace Features.UserManagement.Tests.Queries;

public class GetUserByIdHandlerTests
{
    private readonly Mock<IUserAccountRepository> _repoMock = new();
    private readonly GetUserByIdHandler _handler;

    public GetUserByIdHandlerTests()
    {
        _handler = new GetUserByIdHandler(_repoMock.Object);
    }

    [Fact]
    public async Task Handle_ReturnsUser_WhenFound()
    {
        var user = new UserAccount { UserAccountId = Guid.NewGuid(), Username = "test" };
        _repoMock.Setup(r => r.GetByIdAsync(user.UserAccountId)).ReturnsAsync(user);

        var result = await _handler.Handle(new GetUserByIdQuery(user.UserAccountId), CancellationToken.None);

        result.Should().Be(user);
    }

    [Fact]
    public async Task Handle_Throws_WhenNotFound()
    {
        var id = Guid.NewGuid();
        _repoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync((UserAccount?)null);

        var act = async () => await _handler.Handle(new GetUserByIdQuery(id), CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }
}
