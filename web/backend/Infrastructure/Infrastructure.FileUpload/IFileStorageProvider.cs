namespace Infrastructure.FileUpload;

/// <summary>
///     Service for storing and retrieving uploaded files in S3-compatible object storage.
/// </summary>
public interface IFileStorageProvider
{
    /// <summary>Uploads a file to the configured bucket.</summary>
    /// <param name="key">The object key (path) to store the file under.</param>
    /// <param name="content">The file content.</param>
    /// <param name="contentType">The MIME type of the file.</param>
    /// <param name="cancellationToken">A token to cancel the upload.</param>
    Task UploadAsync(
        string key,
        Stream content,
        string contentType,
        CancellationToken cancellationToken = default
    );

    /// <summary>Deletes a file from the configured bucket.</summary>
    /// <param name="key">The object key of the file to delete.</param>
    /// <param name="cancellationToken">A token to cancel the deletion.</param>
    Task DeleteAsync(string key, CancellationToken cancellationToken = default);

    /// <summary>Generates a time-limited URL for retrieving a file directly from storage.</summary>
    /// <param name="key">The object key of the file.</param>
    /// <param name="expiresIn">How long the URL remains valid.</param>
    string GetPresignedUrl(string key, TimeSpan expiresIn);
}
