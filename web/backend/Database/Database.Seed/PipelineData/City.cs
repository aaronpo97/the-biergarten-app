namespace Database.Seed.PipelineData;

public sealed record City
{
    public required string CityName { get; init; }

    public required string StateProvince { get; init; }

    public required string Iso31662 { get; init; }

    public required string Country { get; init; }

    public required string Iso31661 { get; init; }

    public IReadOnlyList<string> LocalLanguages { get; init; } = [];

    public required PostalCodeSpec PostalCode { get; init; }
}