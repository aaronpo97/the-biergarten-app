using Amazon.S3;
using Amazon.S3.Model;
using Infrastructure.Configuration;
using Microsoft.Extensions.Configuration;

namespace Infrastructure.FileUpload;

/// <summary>
///     File storage service backed by an S3-compatible object store (e.g. SeaweedFS, AWS S3).
///     Configured via application configuration (backed by environment variables).
/// </summary>
public class S3FileStorageProvider : IFileStorageProvider, IDisposable
{
    private readonly string _bucket;
    private readonly IAmazonS3 _client;

    /// <summary>
    ///     Initializes a new instance of the <see cref="S3FileStorageProvider" /> class, reading storage
    ///     configuration (<c>SEAWEEDFS_SERVICE_URL</c>, <c>SEAWEEDFS_ACCESS_KEY_ID</c>,
    ///     <c>SEAWEEDFS_SECRET_ACCESS_KEY</c>, <c>SEAWEEDFS_BUCKET</c>) from <paramref name="configuration" />.
    /// </summary>
    /// <exception cref="InvalidOperationException">
    ///     Thrown when any of the required configuration values is not set.
    /// </exception>
    public S3FileStorageProvider(IConfiguration configuration)
    {
        string serviceUrl = ConfigurationHelpers.GetKeyOrThrow(
            configuration,
            ConfigurationKeys.SeaweedFsServiceUrl
        );
        string accessKeyId = ConfigurationHelpers.GetKeyOrThrow(
            configuration,
            ConfigurationKeys.SeaweedFsAccessKeyId
        );
        string secretAccessKey = ConfigurationHelpers.GetKeyOrThrow(
            configuration,
            ConfigurationKeys.SeaweedFsSecretAccessKey
        );

        _bucket = ConfigurationHelpers.GetKeyOrThrow(
            configuration,
            ConfigurationKeys.SeaweedFsBucket
        );

        AmazonS3Config config = new() { ServiceURL = serviceUrl, ForcePathStyle = true };

        _client = new AmazonS3Client(accessKeyId, secretAccessKey, config);
    }

    /// <inheritdoc/>
    public async Task UploadAsync(
        string key,
        Stream content,
        string contentType,
        CancellationToken cancellationToken = default
    )
    {
        PutObjectRequest request = new()
        {
            BucketName = _bucket,
            Key = key,
            InputStream = content,
            ContentType = contentType,
        };

        await _client.PutObjectAsync(request, cancellationToken);
    }

    /// <inheritdoc/>
    public async Task DeleteAsync(string key, CancellationToken cancellationToken = default)
    {
        DeleteObjectRequest request = new() { BucketName = _bucket, Key = key };

        await _client.DeleteObjectAsync(request, cancellationToken);
    }

    /// <inheritdoc/>
    public string GetPresignedUrl(string key, TimeSpan expiresIn)
    {
        GetPreSignedUrlRequest request = new()
        {
            BucketName = _bucket,
            Key = key,
            Expires = DateTime.UtcNow.Add(expiresIn),
        };

        return _client.GetPreSignedURL(request);
    }

    /// <inheritdoc/>
    public void Dispose()
    {
        _client.Dispose();
        GC.SuppressFinalize(this);
    }
}
