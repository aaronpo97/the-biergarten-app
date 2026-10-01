using Features.ImageUploads.Services;

namespace API.Specs.Mocks;

/// <summary>
///     Test double for <see cref="IFileStorageProvider" /> that records uploads in memory, so specs can
///     exercise photo-backed features without object storage.
/// </summary>
public class MockFileStorageProvider : IFileStorageProvider
{
    private readonly Dictionary<string, byte[]> _objects = new();

    public IReadOnlyCollection<string> UploadedKeys => _objects.Keys.ToList();

    public Task UploadAsync(
        string key,
        Stream content,
        string contentType,
        CancellationToken cancellationToken = default
    )
    {
        using MemoryStream buffer = new();
        content.CopyTo(buffer);
        _objects[key] = buffer.ToArray();
        return Task.CompletedTask;
    }

    public Task DeleteAsync(string key, CancellationToken cancellationToken = default)
    {
        _objects.Remove(key);
        return Task.CompletedTask;
    }

    public string GetPresignedUrl(string key, TimeSpan expiresIn)
    {
        return $"https://storage.test/{key}";
    }
}
