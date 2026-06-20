using Domain.Entities;
using Features.UserManagement.Queries.GetAllUsers;
using Features.UserManagement.Repository;
using FluentAssertions;
using Moq;

namespace Features.UserManagement.Tests.Queries;

public class GetAllUsersHandlerTests
{
    [Fact]
    public async Task Handle_PassesLimitAndOffset_ToRepository()
    {
        Mock<IUserAccountRepository> repoMock = new();
        GetAllUsersHandler handler = new(repoMock.Object);
        repoMock.Setup(r => r.GetAllAsync(10, 5)).ReturnsAsync(Array.Empty<UserAccount>());

        IEnumerable<UserAccount> result = await handler.Handle(
            new GetAllUsersQuery(10, 5),
            CancellationToken.None
        );

        result.Should().BeEmpty();
        repoMock.Verify(r => r.GetAllAsync(10, 5), Times.Once);
    }
}
