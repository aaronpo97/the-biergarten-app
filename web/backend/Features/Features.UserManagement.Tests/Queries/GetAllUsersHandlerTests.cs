using Domain.Entities;
using FluentAssertions;
using Features.UserManagement.Queries.GetAllUsers;
using Features.UserManagement.Repository;
using Moq;

namespace Features.UserManagement.Tests.Queries;

public class GetAllUsersHandlerTests
{
    [Fact]
    public async Task Handle_PassesLimitAndOffset_ToRepository()
    {
        var repoMock = new Mock<IUserAccountRepository>();
        var handler = new GetAllUsersHandler(repoMock.Object);
        repoMock.Setup(r => r.GetAllAsync(10, 5)).ReturnsAsync(Array.Empty<UserAccount>());

        var result = await handler.Handle(new GetAllUsersQuery(10, 5), CancellationToken.None);

        result.Should().BeEmpty();
        repoMock.Verify(r => r.GetAllAsync(10, 5), Times.Once);
    }
}
