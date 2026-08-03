namespace Database.Seed.PipelineData;

public sealed record BreweryResult
{
    public required string NameEn { get; init; }

    public required string DescriptionEn { get; init; }

    public required string NameLocal { get; init; }

    public required string DescriptionLocal { get; init; }
}