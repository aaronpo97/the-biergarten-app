using SkiaSharp;

namespace Database.Seed.DatabaseHelpers;

/// <summary>Generates minimal solid-color square avatars for seeded users.</summary>
public static class AvatarGenerator
{
    private const int SizePx = 128;

    /// <summary>
    ///     Generates a deterministic solid-color PNG avatar, with the color derived from
    ///     <paramref name="userId" />.
    /// </summary>
    public static byte[] GeneratePng(Guid userId)
    {
        byte[] idBytes = userId.ToByteArray();
        SKColor color = new(idBytes[0], idBytes[1], idBytes[2]);

        using SKBitmap bitmap = new(SizePx, SizePx);
        bitmap.Erase(color);

        using SKImage image = SKImage.FromBitmap(bitmap);
        using SKData data = image.Encode(SKEncodedImageFormat.Png, quality: 100);

        return data.ToArray();
    }
}
