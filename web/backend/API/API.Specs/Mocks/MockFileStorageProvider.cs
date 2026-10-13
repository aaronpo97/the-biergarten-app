using Features.ImageUploads.Services;

namespace API.Specs.Mocks;

/// <summary>
///     Test double for <see cref="IFileStorageProvider" /> that records uploads in memory, so specs can
///     exercise photo-backed features without object storage.
/// </summary>
public class MockFileStorageProvider : IFileStorageProvider
{
    private readonly List<string> _keys = [];
    private readonly Dictionary<string, byte[]> _objects = new();

    public IReadOnlyCollection<string> UploadedKeys => _keys.ToList();

    /// <summary>The key of the most recent upload.</summary>
    /// <exception cref="InvalidOperationException">Thrown when nothing has been uploaded yet.</exception>
    public string LastUploadedKey =>
        _keys.Count > 0
            ? _keys[^1]
            : throw new InvalidOperationException("no file has been uploaded");

    public Task UploadAsync(
        string key,
        Stream content,
        string contentType,
        CancellationToken cancellationToken = default
    )
    {
        using MemoryStream buffer = new();
        content.CopyTo(buffer);

        if (!_objects.ContainsKey(key))
            _keys.Add(key);

        _objects[key] = buffer.ToArray();
        return Task.CompletedTask;
    }

    public Task DeleteAsync(string key, CancellationToken cancellationToken = default)
    {
        _objects.Remove(key);
        _keys.Remove(key);
        return Task.CompletedTask;
    }

    /// <summary>
    ///     Stands in for a signed download URL: an absolute URL on a host the object store would serve,
    ///     carrying the key in its path, so specs can assert the shape callers actually receive.
    /// </summary>
    public string GetPresignedUrl(string key, TimeSpan expiresIn)
    {
        return $"https://storage.test/{key}?X-Amz-Expires={(int)expiresIn.TotalSeconds}";
    }
}
