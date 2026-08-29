#pragma warning disable CA1707 // Identifiers should not contain underscores
#pragma warning disable IDE1006 // Naming rule violation
// ReSharper disable InconsistentNaming
/// <summary>Strongly-typed file size units (bytes through gibibytes) that convert and compare by underlying byte value.</summary>
public static class FileSizes
{
    /// <summary>Represents a file size that can be expressed as a number of bytes.</summary>
    public interface IFileSize : IComparable<IFileSize>, IEquatable<IFileSize>
    {
        /// <summary>Gets the size in bytes.</summary>
        ulong Value { get; }
    }

    /// <summary>
    /// Base implementation shared by all file size units. Handles comparison, equality
    /// and hashing on the underlying byte value so that any two <see cref="IFileSize"/>
    /// instances are comparable regardless of the unit they were constructed with.
    /// </summary>
    public abstract class FileSize : IFileSize
    {
        /// <summary>Initializes a new instance of the <see cref="FileSize"/> class from a byte count.</summary>
        protected FileSize(ulong bytes) => Value = bytes;

        /// <summary>Gets the size in bytes.</summary>
        public ulong Value { get; }

        /// <summary>Gets the unit suffix used by <see cref="ToString"/>, e.g. "KiB".</summary>
        protected abstract string UnitSuffix { get; }

        /// <summary>Gets the size expressed in this instance's own unit, for display purposes.</summary>
        protected abstract decimal UnitValue { get; }

        /// <inheritdoc/>
        public int CompareTo(IFileSize? other) =>
            other is null ? 1 : Value.CompareTo(other.Value);

        /// <inheritdoc/>
        public bool Equals(IFileSize? other) =>
            other is not null && Value == other.Value;

        /// <inheritdoc/>
        public override bool Equals(object? obj) =>
            obj is IFileSize other && Equals(other);

        /// <inheritdoc/>
        public override int GetHashCode() => Value.GetHashCode();

        /// <inheritdoc/>
        /// <remarks>Formats using this instance's own unit, e.g. "4.52 GiB" — not the smallest common unit.</remarks>
        public override string ToString() => $"{UnitValue} {UnitSuffix}";

        /// <summary>Determines whether two file sizes represent the same number of bytes.</summary>
        public static bool operator ==(FileSize? left, IFileSize? right) =>
            left is null ? right is null : left.Equals(right);

        /// <summary>Determines whether two file sizes represent a different number of bytes.</summary>
        public static bool operator !=(FileSize? left, IFileSize? right) => !(left == right);

        /// <summary>Determines whether the left file size is smaller than the right.</summary>
        public static bool operator <(FileSize left, IFileSize right) => left.CompareTo(right) < 0;

        /// <summary>Determines whether the left file size is larger than the right.</summary>
        public static bool operator >(FileSize left, IFileSize right) => left.CompareTo(right) > 0;

        /// <summary>Determines whether the left file size is smaller than or equal to the right.</summary>
        public static bool operator <=(FileSize left, IFileSize right) => left.CompareTo(right) <= 0;

        /// <summary>Determines whether the left file size is larger than or equal to the right.</summary>
        public static bool operator >=(FileSize left, IFileSize right) => left.CompareTo(right) >= 0;

        /// <summary>Adds two file sizes, returning the result in bytes.</summary>
        public static Bytes operator +(FileSize left, IFileSize right) => new(left.Value + right.Value);

        /// <summary>Subtracts one file size from another, returning the result in bytes.</summary>
        public static Bytes operator -(FileSize left, IFileSize right) => new(left.Value - right.Value);

        /// <summary>Converts a fractional count of a unit (e.g. 4.52 GB) into whole bytes.</summary>
        protected static ulong ToBytes(decimal unitValue, decimal bytesPerUnit) =>
            (ulong)Math.Round(unitValue * bytesPerUnit, MidpointRounding.AwayFromZero);

    }

    /// <summary>Represents a size in bytes. Bytes are atomic, so this is the only unit that takes a whole number.</summary>
    public sealed class Bytes(ulong value) : FileSize(value)
    {
        /// <summary>Converts a size expressed in any unit into bytes.</summary>
        public Bytes(IFileSize other) : this(other.Value)
        {
        }

        /// <inheritdoc/>
        protected override string UnitSuffix => "bytes";

        /// <inheritdoc/>
        protected override decimal UnitValue => Value;


    }

    /// <summary>Represents a size in kilobytes (decimal: 1,000 bytes).</summary>
    public sealed class KB(decimal value) : FileSize(ToBytes(value, BytesPerUnit))
    {
        private const decimal BytesPerUnit = 1_000;

        /// <summary>Converts a size expressed in any unit into kilobytes.</summary>
        public KB(IFileSize other) : this(other.Value / BytesPerUnit)
        {
        }

        /// <inheritdoc/>
        protected override string UnitSuffix => "KB";

        /// <inheritdoc/>
        protected override decimal UnitValue => Value / BytesPerUnit;
    }

    /// <summary>Represents a size in kibibytes (binary: 1,024 bytes).</summary>
    public sealed class KiB(decimal value) : FileSize(ToBytes(value, BytesPerUnit))
    {
        private const decimal BytesPerUnit = 1_024;

        /// <summary>Converts a size expressed in any unit into kibibytes.</summary>
        public KiB(IFileSize other) : this(other.Value / BytesPerUnit)
        {
        }

        /// <inheritdoc/>
        protected override string UnitSuffix => "KiB";

        /// <inheritdoc/>
        protected override decimal UnitValue => Value / BytesPerUnit;
    }

    /// <summary>Represents a size in megabytes (decimal: 1,000,000 bytes).</summary>
    public sealed class MB(decimal value) : FileSize(ToBytes(value, BytesPerUnit))
    {
        private const decimal BytesPerUnit = 1_000_000;

        /// <summary>Converts a size expressed in any unit into megabytes.</summary>
        public MB(IFileSize other) : this(other.Value / BytesPerUnit)
        {
        }

        /// <inheritdoc/>
        protected override string UnitSuffix => "MB";

        /// <inheritdoc/>
        protected override decimal UnitValue => Value / BytesPerUnit;
    }

    /// <summary>Represents a size in mebibytes (binary: 1,048,576 bytes).</summary>
    public sealed class MiB(decimal value) : FileSize(ToBytes(value, BytesPerUnit))
    {
        private const decimal BytesPerUnit = 1_048_576;

        /// <summary>Converts a size expressed in any unit into mebibytes.</summary>
        public MiB(IFileSize other) : this(other.Value / BytesPerUnit)
        {
        }

        /// <inheritdoc/>
        protected override string UnitSuffix => "MiB";

        /// <inheritdoc/>
        protected override decimal UnitValue => Value / BytesPerUnit;
    }

    /// <summary>Represents a size in gigabytes (decimal: 1,000,000,000 bytes).</summary>
    public sealed class GB(decimal value) : FileSize(ToBytes(value, BytesPerUnit))
    {
        private const decimal BytesPerUnit = 1_000_000_000;

        /// <summary>Converts a size expressed in any unit into gigabytes.</summary>
        public GB(IFileSize other) : this(other.Value / BytesPerUnit)
        {
        }

        /// <inheritdoc/>
        protected override string UnitSuffix => "GB";

        /// <inheritdoc/>
        protected override decimal UnitValue => Value / BytesPerUnit;
    }

    /// <summary>Represents a size in gibibytes (binary: 1,073,741,824 bytes).</summary>
    public sealed class GiB(decimal value) : FileSize(ToBytes(value, BytesPerUnit))
    {
        private const decimal BytesPerUnit = 1_073_741_824;

        /// <summary>Converts a size expressed in any unit into gibibytes.</summary>
        public GiB(IFileSize other) : this(other.Value / BytesPerUnit)
        {
        }

        /// <inheritdoc/>
        protected override string UnitSuffix => "GiB";

        /// <inheritdoc/>
        protected override decimal UnitValue => Value / BytesPerUnit;
    }
}
#pragma warning restore CA1707
#pragma warning restore IDE1006