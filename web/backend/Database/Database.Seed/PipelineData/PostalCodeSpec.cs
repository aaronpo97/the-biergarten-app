namespace Database.Seed.PipelineData;

public sealed record PostalCodeSpec
{
    public required string CountryFormatRegex { get; init; }

    public IReadOnlyList<string> CityRegexes { get; init; } = [];

    public IReadOnlyList<string> Examples { get; init; } = [];
}
