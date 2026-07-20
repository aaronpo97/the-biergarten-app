namespace Database.Seed.PipelineData;

public sealed record BreweryAddress
{
    public required City City { get; init; }

    public required string PostalCode { get; init; }
}
