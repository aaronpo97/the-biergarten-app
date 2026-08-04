using System.Security.Cryptography;
using System.Text;
using Konscious.Security.Cryptography;

namespace Infrastructure.PasswordHashing;

/// <summary>
///     Hashes and verifies passwords using the Argon2id algorithm via Konscious.Security.Cryptography.
/// </summary>
public class Argon2Infrastructure : IPasswordInfrastructure
{
    private const int SaltSize = 16; // 128-bit
    private const int HashSize = 32; // 256-bit
    private const int ArgonIterations = 4;
    private const int ArgonMemoryKb = 65536; // 64MB

    /// <summary>
    ///     Hashes a plaintext password using Argon2id with a fresh random salt.
    /// </summary>
    /// <returns>A string of the form <c>"{base64Salt}:{base64Hash}"</c>, suitable for storage.</returns>
    public string Hash(string password)
    {
        byte[] salt = RandomNumberGenerator.GetBytes(SaltSize);
        Argon2id argon2 = new(Encoding.UTF8.GetBytes(password))
        {
            Salt = salt,
            DegreeOfParallelism = Math.Max(Environment.ProcessorCount, 1),
            MemorySize = ArgonMemoryKb,
            Iterations = ArgonIterations,
        };

        byte[] hash = argon2.GetBytes(HashSize);
        return $"{Convert.ToBase64String(salt)}:{Convert.ToBase64String(hash)}";
    }

    /// <summary>
    ///     Verifies a plaintext password against a stored salt/hash string, using a fixed-time comparison
    ///     to mitigate timing attacks.
    /// </summary>
    /// <returns>
    ///     <c>false</c> if the password doesn't match, if <paramref name="stored" /> is malformed, or if any
    ///     other error occurs during verification.
    /// </returns>
    public bool Verify(string password, string stored)
    {
        try
        {
            string[] parts = stored.Split(':', StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length != 2)
                return false;

            byte[] salt = Convert.FromBase64String(parts[0]);
            byte[] expected = Convert.FromBase64String(parts[1]);

            Argon2id argon2 = new(Encoding.UTF8.GetBytes(password))
            {
                Salt = salt,
                DegreeOfParallelism = Math.Max(Environment.ProcessorCount, 1),
                MemorySize = ArgonMemoryKb,
                Iterations = ArgonIterations,
            };

            byte[] actual = argon2.GetBytes(expected.Length);
            return CryptographicOperations.FixedTimeEquals(actual, expected);
        }
        catch
        {
            return false;
        }
    }
}
