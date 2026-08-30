using Domain.Entities;

namespace Features.Auth.Identity;

/// <summary>
///     Converts the persistence-agnostic <see cref="UserAccount" /> domain entity into the
///     <see cref="ApplicationUser" /> shape required by <see cref="Microsoft.AspNetCore.Identity.UserManager{TUser}" />.
///     Kept here, in Features.Users, rather than on <see cref="UserAccount" /> itself so the domain layer has
///     no dependency on ASP.NET Core Identity.
/// </summary>
public static class UserAccountExtensions
{
    public static ApplicationUser ToApplicationUser(this UserAccount userAccount) =>
        new()
        {
            Id = userAccount.UserAccountId,
            UserName = userAccount.Username,
            Email = userAccount.Email,
            FirstName = userAccount.FirstName,
            LastName = userAccount.LastName,
            DateOfBirth = userAccount.DateOfBirth,
        };
}
