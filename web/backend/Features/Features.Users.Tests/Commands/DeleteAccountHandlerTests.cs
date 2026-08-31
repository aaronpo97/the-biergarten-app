using Domain.Exceptions;
using Features.Auth.Commands.Account.DeleteAccount;
using Features.Auth.Identity;
using Features.Auth.Tests.TestSupport;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Moq;

namespace Features.Auth.Tests.Commands;

public class DeleteAccountHandlerTests
{
    private readonly DeleteAccountHandler _handler;
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;

    public DeleteAccountHandlerTests()
    {
        _userManagerMock = UserManagerMockFactory.Create();
        _handler = new DeleteAccountHandler(_userManagerMock.Object);
    }

    [Fact]
    public async Task Handle_WithExistingUser_DeletesAccount()
    {
        Guid userId = Guid.NewGuid();
        ApplicationUser user = new() { Id = userId };

        _userManagerMock.Setup(x => x.FindByIdAsync(userId.ToString())).ReturnsAsync(user);
        _userManagerMock.Setup(x => x.DeleteAsync(user)).ReturnsAsync(IdentityResult.Success);

        await _handler.Handle(new DeleteAccountCommand(userId), CancellationToken.None);

        _userManagerMock.Verify(x => x.DeleteAsync(user), Times.Once);
    }

    [Fact]
    public async Task Handle_WithNonExistentUser_ThrowsNotFoundException()
    {
        Guid userId = Guid.NewGuid();
        _userManagerMock
            .Setup(x => x.FindByIdAsync(userId.ToString()))
            .ReturnsAsync((ApplicationUser?)null);

        Func<Task> act = async () =>
            await _handler.Handle(new DeleteAccountCommand(userId), CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task Handle_WithDependentRecords_ThrowsConflictException()
    {
        Guid userId = Guid.NewGuid();
        ApplicationUser user = new() { Id = userId };

        _userManagerMock.Setup(x => x.FindByIdAsync(userId.ToString())).ReturnsAsync(user);
        _userManagerMock
            .Setup(x => x.DeleteAsync(user))
            .ReturnsAsync(
                IdentityResult.Failed(
                    new IdentityError
                    {
                        Code = "AccountHasDependentRecords",
                        Description = "still referenced",
                    }
                )
            );

        Func<Task> act = async () =>
            await _handler.Handle(new DeleteAccountCommand(userId), CancellationToken.None);

        await act.Should().ThrowAsync<ConflictException>();
    }
}
