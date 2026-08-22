using Infrastructure.PasswordHashing;
using Microsoft.AspNetCore.Identity;

namespace Features.Auth.Identity;

public sealed class Argon2PasswordHasher(IPasswordInfrastructure passwordInfrastructure)
    : IPasswordHasher<ApplicationUser>
{
    public string HashPassword(ApplicationUser user, string password) =>
        passwordInfrastructure.Hash(password);

    public PasswordVerificationResult VerifyHashedPassword(
        ApplicationUser user,
        string hashedPassword,
        string providedPassword
    ) =>
        passwordInfrastructure.Verify(providedPassword, hashedPassword)
            ? PasswordVerificationResult.Success
            : PasswordVerificationResult.Failed;
}
