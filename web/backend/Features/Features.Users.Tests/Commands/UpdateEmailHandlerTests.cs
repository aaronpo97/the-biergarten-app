using Domain.Exceptions;
using Features.Auth.Commands.UpdateEmail;
using Features.Auth.Dtos;
using Features.Auth.Identity;
using Features.Auth.Tests.TestSupport;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Moq;

namespace Features.Auth.Tests.Commands;

public class UpdateEmailHandlerTests
{
    private readonly UpdateEmailHandler _handler;
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;

    public UpdateEmailHandlerTests()
    {
        _userManagerMock = UserManagerMockFactory.Create();
        _handler = new UpdateEmailHandler(_userManagerMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidRequest_UpdatesEmailAndResetsConfirmation()
    {
        Guid userId = Guid.NewGuid();
        ApplicationUser user = new()
        {
            Id = userId,
            Email = "old@example.com",
            EmailConfirmed = true,
        };

        _userManagerMock.Setup(x => x.FindByIdAsync(userId.ToString())).ReturnsAsync(user);
        _userManagerMock
            .Setup(x => x.SetEmailAsync(user, "new@example.com"))
            .Callback<ApplicationUser, string>(
                (u, e) =>
                {
                    u.Email = e;
                    u.EmailConfirmed = false;
                }
            )
            .ReturnsAsync(IdentityResult.Success);

        UpdateEmailPayload result = await _handler.Handle(
            new UpdateEmailCommand(userId, "new@example.com"),
            CancellationToken.None
        );

        result.UserAccountId.Should().Be(userId);
        result.Email.Should().Be("new@example.com");
        result.EmailConfirmed.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_WithNonExistentUser_ThrowsNotFoundException()
    {
        Guid userId = Guid.NewGuid();
        _userManagerMock
            .Setup(x => x.FindByIdAsync(userId.ToString()))
            .ReturnsAsync((ApplicationUser?)null);

        Func<Task<UpdateEmailPayload>> act = async () =>
            await _handler.Handle(
                new UpdateEmailCommand(userId, "new@example.com"),
                CancellationToken.None
            );

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task Handle_WithDuplicateEmail_ThrowsConflictException()
    {
        Guid userId = Guid.NewGuid();
        ApplicationUser user = new() { Id = userId, Email = "old@example.com" };

        _userManagerMock.Setup(x => x.FindByIdAsync(userId.ToString())).ReturnsAsync(user);
        _userManagerMock
            .Setup(x => x.SetEmailAsync(user, "taken@example.com"))
            .ReturnsAsync(
                IdentityResult.Failed(
                    new IdentityError { Code = "DuplicateEmail", Description = "taken" }
                )
            );

        Func<Task<UpdateEmailPayload>> act = async () =>
            await _handler.Handle(
                new UpdateEmailCommand(userId, "taken@example.com"),
                CancellationToken.None
            );

        await act.Should().ThrowAsync<ConflictException>();
    }
}
