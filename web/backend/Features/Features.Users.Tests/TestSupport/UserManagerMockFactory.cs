using Features.Users.Identity;
using Microsoft.AspNetCore.Identity;
using Moq;

namespace Features.Users.Tests.TestSupport;

public static class UserManagerMockFactory
{
    public static Mock<UserManager<ApplicationUser>> Create()
    {
        Mock<IUserStore<ApplicationUser>> storeMock = new();
        return new Mock<UserManager<ApplicationUser>>(
            storeMock.Object,
            null!,
            null!,
            null!,
            null!,
            null!,
            null!,
            null!,
            null!
        );
    }
}
