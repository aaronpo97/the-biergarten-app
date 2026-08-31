using Domain.Exceptions;
using Features.Auth.Commands.Profile.UpdateProfile;
using Features.Auth.Dtos;
using Features.Auth.Identity;
using Features.Auth.Tests.TestSupport;
using FluentAssertions;
using Microsoft.AspNetCore.Identity;
using Moq;

namespace Features.Auth.Tests.Commands;

public class UpdateProfileHandlerTests
{
    private readonly UpdateProfileHandler _handler;
    private readonly Mock<UserManager<ApplicationUser>> _userManagerMock;

    public UpdateProfileHandlerTests()
    {
        _userManagerMock = UserManagerMockFactory.Create();
        _handler = new UpdateProfileHandler(_userManagerMock.Object);
    }

    [Fact]
    public async Task Handle_WithValidRequest_UpdatesProfileFields()
    {
        Guid userId = Guid.NewGuid();
        ApplicationUser user = new()
        {
            Id = userId,
            FirstName = "Old",
            LastName = "Name",
            DateOfBirth = new DateTime(1990, 1, 1),
        };
        DateTime newDob = new(1991, 2, 3);

        _userManagerMock.Setup(x => x.FindByIdAsync(userId.ToString())).ReturnsAsync(user);
        _userManagerMock.Setup(x => x.UpdateAsync(user)).ReturnsAsync(IdentityResult.Success);

        UpdateProfilePayload result = await _handler.Handle(
            new UpdateProfileCommand(userId, "New", "Person", newDob),
            CancellationToken.None
        );

        result.UserAccountId.Should().Be(userId);
        result.FirstName.Should().Be("New");
        result.LastName.Should().Be("Person");
        result.DateOfBirth.Should().Be(newDob);
        _userManagerMock.Verify(x => x.UpdateAsync(user), Times.Once);
    }

    [Fact]
    public async Task Handle_WithNonExistentUser_ThrowsNotFoundException()
    {
        Guid userId = Guid.NewGuid();
        _userManagerMock
            .Setup(x => x.FindByIdAsync(userId.ToString()))
            .ReturnsAsync((ApplicationUser?)null);

        Func<Task<UpdateProfilePayload>> act = async () =>
            await _handler.Handle(
                new UpdateProfileCommand(userId, "New", "Person", DateTime.Today),
                CancellationToken.None
            );

        await act.Should().ThrowAsync<NotFoundException>();
    }
}
