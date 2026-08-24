using System.Globalization;
using System.Net.Http.Json;
using System.Text.Json.Serialization;

namespace Database.Seed.Geocoding;

public sealed record ReverseGeocodeResult(string AddressLine1, string PostalCode);

internal sealed record NominatimAddress
{
    [JsonPropertyName("house_number")]
    public string? HouseNumber { get; init; }

    [JsonPropertyName("road")]
    public string? Road { get; init; }

    [JsonPropertyName("postcode")]
    public string? Postcode { get; init; }
}

internal sealed record NominatimReverseGeocodeResponse
{
    [JsonPropertyName("address")]
    public NominatimAddress? Address { get; init; }

    [JsonPropertyName("error")]
    public string? Error { get; init; }
}

/// <summary>
///     Reverse geocodes coordinates into street addresses via the public Nominatim API
///     (https://nominatim.openstreetmap.org), following its usage policy of a single
///     identifying User-Agent and at most one request per second
///     (https://operations.osmfoundation.org/policies/nominatim/).
/// </summary>
public sealed class NominatimReverseGeocoder : IDisposable
{
    private const string ReverseEndpoint = "https://nominatim.openstreetmap.org/reverse";
    private static readonly TimeSpan MinRequestInterval = TimeSpan.FromSeconds(1);

    private readonly HttpClient _httpClient;
    private readonly SemaphoreSlim _rateLimitLock = new(1, 1);
    private DateTime _lastRequestUtc = DateTime.MinValue;

    public NominatimReverseGeocoder(string userAgent)
    {
        _httpClient = new HttpClient();
        _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd(userAgent);
    }

    /// <summary>
    ///     Reverse geocodes a coordinate pair, returning <c>null</c> if Nominatim has no address
    ///     for the point or the request fails so callers can fall back to a placeholder address.
    /// </summary>
    public async Task<ReverseGeocodeResult?> ReverseGeocodeAsync(
        double longitude,
        double latitude,
        CancellationToken cancellationToken = default
    )
    {
        await WaitForRateLimitAsync(cancellationToken);

        string url =
            $"{ReverseEndpoint}?format=jsonv2"
            + $"&lat={latitude.ToString(CultureInfo.InvariantCulture)}"
            + $"&lon={longitude.ToString(CultureInfo.InvariantCulture)}"
            + "&zoom=18&addressdetails=1";

        try
        {
            NominatimReverseGeocodeResponse? response =
                await _httpClient.GetFromJsonAsync<NominatimReverseGeocodeResponse>(
                    url,
                    cancellationToken
                );

            if (response?.Address is null || response.Error is not null)
                return null;

            string addressLine1 = string.Join(
                ' ',
                new[] { response.Address.HouseNumber, response.Address.Road }.Where(
                    part => !string.IsNullOrWhiteSpace(part)
                )
            );

            return string.IsNullOrWhiteSpace(addressLine1)
                ? null
                : new ReverseGeocodeResult(addressLine1, response.Address.Postcode ?? string.Empty);
        }
        catch (HttpRequestException)
        {
            return null;
        }
        catch (TaskCanceledException) when (!cancellationToken.IsCancellationRequested)
        {
            // HttpClient's own timeout elapsed here.
            return null;
        }
    }

    private async Task WaitForRateLimitAsync(CancellationToken cancellationToken)
    {
        await _rateLimitLock.WaitAsync(cancellationToken);
        try
        {
            TimeSpan elapsed = DateTime.UtcNow - _lastRequestUtc;
            if (elapsed < MinRequestInterval)
                await Task.Delay(MinRequestInterval - elapsed, cancellationToken);

            _lastRequestUtc = DateTime.UtcNow;
        }
        finally
        {
            _rateLimitLock.Release();
        }
    }

    public void Dispose()
    {
        _httpClient.Dispose();
        _rateLimitLock.Dispose();
    }
}
