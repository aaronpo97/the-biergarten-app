using Domain.Exceptions;
using Features.Auth.Commands.Account.UpdateUsername;
using Features.Auth.Dtos;
using Features.Auth.Identity;
using Features.Auth.Tests.TestSupport;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Moq;

namespace Features.Auth.Tests.Commands;

public class UpdateUsernameHandlerTests
{
    private readonly UpdateUsernameHandler _handler;
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;

    public UpdateUsernameHandlerTests()
    {
        _userManagerMock = UserManagerMockFactory.Create();
        _handler = new UpdateUsernameHandler(_userManagerMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidRequest_UpdatesUsername()
    {
        Guid userId = Guid.NewGuid();
        ApplicationUser user = new() { Id = userId, UserName = "old-name" };

        _userManagerMock.Setup(x => x.FindByIdAsync(userId.ToString())).ReturnsAsync(user);
        _userManagerMock
            .Setup(x => x.SetUserNameAsync(user, "new-name"))
            .Callback<ApplicationUser, string>((u, n) => u.UserName = n)
            .ReturnsAsync(IdentityResult.Success);

        UpdateUsernamePayload result = await _handler.Handle(
            new UpdateUsernameCommand(userId, "new-name"),
            CancellationToken.None
        );

        result.UserAccountId.Should().Be(userId);
        result.Username.Should().Be("new-name");
    }

    [Fact]
    public async Task Handle_WithNonExistentUser_ThrowsNotFoundException()
    {
        Guid userId = Guid.NewGuid();
        _userManagerMock
            .Setup(x => x.FindByIdAsync(userId.ToString()))
            .ReturnsAsync((ApplicationUser?)null);

        Func<Task<UpdateUsernamePayload>> act = async () =>
            await _handler.Handle(
                new UpdateUsernameCommand(userId, "new-name"),
                CancellationToken.None
            );

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task Handle_WithDuplicateUsername_ThrowsConflictException()
    {
        Guid userId = Guid.NewGuid();
        ApplicationUser user = new() { Id = userId, UserName = "old-name" };

        _userManagerMock.Setup(x => x.FindByIdAsync(userId.ToString())).ReturnsAsync(user);
        _userManagerMock
            .Setup(x => x.SetUserNameAsync(user, "taken-name"))
            .ReturnsAsync(
                IdentityResult.Failed(
                    new IdentityError { Code = "DuplicateUserName", Description = "taken" }
                )
            );

        Func<Task<UpdateUsernamePayload>> act = async () =>
            await _handler.Handle(
                new UpdateUsernameCommand(userId, "taken-name"),
                CancellationToken.None
            );

        await act.Should().ThrowAsync<ConflictException>();
    }
}
