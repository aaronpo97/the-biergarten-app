namespace Features.Auth.Identity;

/// <summary>
///     The user type driving <see cref="Microsoft.AspNetCore.Identity.UserManager{TUser}" /> for
///     Features.Auth. A plain POCO (not <c>IdentityUser&lt;TKey&gt;</c>) backed by <see cref="DapperUserStore" />
///     rather than EF Core, matching the rest of the solution's Dapper-only persistence.
/// </summary>
public sealed class ApplicationUser
{
    public Guid Id { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string? NormalizedUserName { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? NormalizedEmail { get; set; }
    public bool EmailConfirmed { get; set; }

    /// <summary>The current Argon2 hash, or <see langword="null" /> if the account has no password set.</summary>
    public string? PasswordHash { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
}
