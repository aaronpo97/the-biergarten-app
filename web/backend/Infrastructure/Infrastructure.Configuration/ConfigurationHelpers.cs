using Microsoft.Extensions.Configuration;

namespace Infrastructure.Configuration;

public static class ConfigurationHelpers
{
    public static string GetKeyOrThrow(IConfiguration configuration, string key) =>
        configuration[key]
        ?? throw new InvalidOperationException($"The {key} environment variable is not set.");

    public static bool GetBooleanKeyOrThrow(IConfiguration configuration, string key)
    {
        string value = GetKeyOrThrow(configuration, key);

        return bool.TryParse(value, out bool result)
            ? result
            : throw new InvalidOperationException(
                $"The {key} environment variable is set to '{value}', which is not a valid boolean."
            );
    }

    public static int GetIntKeyOrThrow(IConfiguration configuration, string key)
    {
        string value = GetKeyOrThrow(configuration, key);

        return int.TryParse(value, out int result)
            ? result
            : throw new InvalidOperationException(
                $"The {key} environment variable is set to '{value}', which is not a valid integer."
            );
    }
}
