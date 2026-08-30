using System;
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
    private const int DegreeOfParallelism = 2; // Hardcoded to prevent thread pool exhaustion

    public string Hash(string password)
    {
        byte[] salt = RandomNumberGenerator.GetBytes(SaltSize);

        using Argon2id argon2 = new(Encoding.UTF8.GetBytes(password))
        {
            Salt = salt,
            DegreeOfParallelism = DegreeOfParallelism,
            MemorySize = ArgonMemoryKb,
            Iterations = ArgonIterations,
        };

        byte[] hash = argon2.GetBytes(HashSize);

        // The PHC string standard requires Base64 without the trailing '=' padding characters
        string b64Salt = Convert.ToBase64String(salt).TrimEnd('=');
        string b64Hash = Convert.ToBase64String(hash).TrimEnd('=');

        // Argon2 version is currently 19 (0x13 in hex)
        return $"$argon2id$v=19$m={ArgonMemoryKb},t={ArgonIterations},p={DegreeOfParallelism}${b64Salt}${b64Hash}";
    }

    /// <inheritdoc />
    /// <remarks>Uses a fixed-time comparison to mitigate timing attacks. Supports standard PHC string format.</remarks>
    /// <returns>
    ///     <c>false</c> if the password doesn't match, if <paramref name="stored" /> is malformed, or if any
    ///     other error occurs during verification.
    /// </returns>
    public bool Verify(string password, string stored)
    {
        try
        {
            // Split the PHC format: $argon2id$v=19$m=65536,t=3,p=4$salt$hash
            string[] parts = stored.Split('$', StringSplitOptions.RemoveEmptyEntries);

            // We expect exactly 5 parts when empty entries (the one before the first $) are removed
            if (parts.Length != 5 || parts[0] != "argon2id")
                return false;

            int memory = 0,
                iterations = 0,
                parallelism = 0;
            string[] parameters = parts[2].Split(',');

            foreach (string param in parameters)
            {
                if (param.StartsWith("m="))
                    memory = int.Parse(param.Substring(2));
                else if (param.StartsWith("t="))
                    iterations = int.Parse(param.Substring(2));
                else if (param.StartsWith("p="))
                    parallelism = int.Parse(param.Substring(2));
            }

            byte[] salt = DecodeBase64NoPadding(parts[3]);
            byte[] expectedHash = DecodeBase64NoPadding(parts[4]);

            // Use the parameters embedded in the stored string, so previously hashed
            // passwords remain verifiable after a parameter change.
            using Argon2id argon2 = new(Encoding.UTF8.GetBytes(password))
            {
                Salt = salt,
                DegreeOfParallelism = parallelism,
                MemorySize = memory,
                Iterations = iterations,
            };

            byte[] actualHash = argon2.GetBytes(expectedHash.Length);

            return CryptographicOperations.FixedTimeEquals(actualHash, expectedHash);
        }
        catch
        {
            return false;
        }
    }

    /// <summary>
    /// .NET's Convert.FromBase64String requires padding. The PHC format drops padding.
    /// This helper restores the padding before converting.
    /// </summary>
    private static byte[] DecodeBase64NoPadding(string base64)
    {
        string padded = base64.PadRight(base64.Length + (4 - base64.Length % 4) % 4, '=');
        return Convert.FromBase64String(padded);
    }
}
