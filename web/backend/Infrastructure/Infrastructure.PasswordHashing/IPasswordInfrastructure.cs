namespace Infrastructure.PasswordHashing;

/// <summary>
///     Service for hashing and verifying user passwords.
/// </summary>
public interface IPasswordInfrastructure
{
    /// <summary>
    ///     Hashes a plaintext password, generating a new random salt.
    /// </summary>
    public string Hash(string password);

    /// <summary>
    ///     Verifies a plaintext password against a previously stored hash produced by <see cref="Hash" />.
    /// </summary>
    public bool Verify(string password, string stored);
}
