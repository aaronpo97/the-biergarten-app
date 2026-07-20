namespace Database.Seed.PipelineData;

public sealed record BreweryRecord
{
    public required BreweryAddress Address { get; init; }

    public required BreweryResult Brewery { get; init; }
}
