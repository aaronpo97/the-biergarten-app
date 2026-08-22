using Domain.Exceptions;
using Features.Auth.Commands.UpdatePassword;
using Features.Auth.Dtos;
using Features.Auth.Identity;
using Features.Auth.Tests.TestSupport;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Moq;

namespace Features.Auth.Tests.Commands;

public class UpdatePasswordHandlerTests
{
    private readonly UpdatePasswordHandler _handler;
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;

    public UpdatePasswordHandlerTests()
    {
        _userManagerMock = UserManagerMockFactory.Create();
        _handler = new UpdatePasswordHandler(_userManagerMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidRequest_ChangesPassword()
    {
        Guid userId = Guid.NewGuid();
        ApplicationUser user = new() { Id = userId };

        _userManagerMock.Setup(x => x.FindByIdAsync(userId.ToString())).ReturnsAsync(user);
        _userManagerMock
            .Setup(x => x.ChangePasswordAsync(user, "OldPassword1!", "NewPassword1!"))
            .ReturnsAsync(IdentityResult.Success);

        UpdatePasswordPayload result = await _handler.Handle(
            new UpdatePasswordCommand(userId, "OldPassword1!", "NewPassword1!"),
            CancellationToken.None
        );

        result.UserAccountId.Should().Be(userId);
        result.ChangedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(1));
    }

    [Fact]
    public async Task Handle_WithNonExistentUser_ThrowsNotFoundException()
    {
        Guid userId = Guid.NewGuid();
        _userManagerMock
            .Setup(x => x.FindByIdAsync(userId.ToString()))
            .ReturnsAsync((ApplicationUser?)null);

        Func<Task<UpdatePasswordPayload>> act = async () =>
            await _handler.Handle(
                new UpdatePasswordCommand(userId, "OldPassword1!", "NewPassword1!"),
                CancellationToken.None
            );

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task Handle_WithWrongCurrentPassword_ThrowsUnauthorizedException()
    {
        Guid userId = Guid.NewGuid();
        ApplicationUser user = new() { Id = userId };

        _userManagerMock.Setup(x => x.FindByIdAsync(userId.ToString())).ReturnsAsync(user);
        _userManagerMock
            .Setup(x => x.ChangePasswordAsync(user, "WrongPassword1!", "NewPassword1!"))
            .ReturnsAsync(
                IdentityResult.Failed(
                    new IdentityError { Code = "PasswordMismatch", Description = "mismatch" }
                )
            );

        Func<Task<UpdatePasswordPayload>> act = async () =>
            await _handler.Handle(
                new UpdatePasswordCommand(userId, "WrongPassword1!", "NewPassword1!"),
                CancellationToken.None
            );

        await act.Should().ThrowAsync<UnauthorizedException>();
    }
}
