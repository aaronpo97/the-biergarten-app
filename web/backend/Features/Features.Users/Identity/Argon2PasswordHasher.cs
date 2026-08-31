using Infrastructure.PasswordHashing;
using Microsoft.AspNetCore.Identity;

namespace Features.Auth.Identity;

/// <summary>Adapts <see cref="IPasswordInfrastructure" />'s Argon2 hashing to <see cref="IPasswordHasher{TUser}" />.</summary>
public sealed class Argon2PasswordHasher(IPasswordInfrastructure passwordInfrastructure)
    : IPasswordHasher<ApplicationUser>
{
    /// <inheritdoc />
    public string HashPassword(ApplicationUser user, string password) =>
        passwordInfrastructure.Hash(password);

    /// <inheritdoc />
    /// <remarks>
    ///     Never returns <see cref="PasswordVerificationResult.SuccessRehashNeeded" />: Argon2 parameters are
    ///     fixed by <see cref="IPasswordInfrastructure" />, so <see cref="UserManager{TUser}" />'s automatic
    ///     rehash-on-verify path never triggers.
    /// </remarks>
    public PasswordVerificationResult VerifyHashedPassword(
        ApplicationUser user,
        string hashedPassword,
        string providedPassword
    ) =>
        passwordInfrastructure.Verify(providedPassword, hashedPassword)
            ? PasswordVerificationResult.Success
            : PasswordVerificationResult.Failed;
}
