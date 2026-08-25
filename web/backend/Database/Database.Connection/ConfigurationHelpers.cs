using Microsoft.Extensions.Configuration;

namespace Database.Connection;

public static class ConfigurationHelpers
{
    public static string GetKeyOrThrow(IConfiguration configuration, string key) =>
        configuration[key]
        ?? throw new InvalidOperationException($"The {key} environment variable is not set.");
}
