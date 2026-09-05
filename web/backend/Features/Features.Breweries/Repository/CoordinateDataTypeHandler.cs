using System.Data;
using Dapper;
using Domain.Entities;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO;

namespace Features.Breweries.Repository;

/// <summary>
///     Converts SQL Server geography values read as binary data into <see cref="CoordinateData" />.
/// </summary>
public sealed class CoordinateDataTypeHandler : SqlMapper.TypeHandler<CoordinateData>
{
    private readonly SqlServerBytesReader _reader = new() { IsGeography = true };

    public override CoordinateData Parse(object value)
    {
        var point = (Point)_reader.Read((byte[])value);
        return new CoordinateData(point.Y, point.X);
    }

    public override void SetValue(IDbDataParameter parameter, CoordinateData? value) =>
        throw new NotSupportedException(
            $"{nameof(CoordinateData)} cannot be bound as a query parameter directly; "
                + "pass Latitude/Longitude and build the GEOGRAPHY value in SQL text."
        );
}
