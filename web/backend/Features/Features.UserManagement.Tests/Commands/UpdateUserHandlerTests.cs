using Domain.Entities;
using Features.UserManagement.Commands.UpdateUser;
using Features.UserManagement.Repository;
using Moq;

namespace Features.UserManagement.Tests.Commands;

public class UpdateUserHandlerTests
{
    [Fact]
    public async Task Handle_DelegatesToRepository()
    {
        Mock<IUserAccountRepository> repoMock = new();
        UpdateUserHandler handler = new(repoMock.Object);
        UserAccount user = new() { UserAccountId = Guid.NewGuid() };
        repoMock.Setup(r => r.UpdateAsync(user)).Returns(Task.CompletedTask);

        await handler.Handle(new UpdateUserCommand(user), CancellationToken.None);

        repoMock.Verify(r => r.UpdateAsync(user), Times.Once);
    }
}
