namespace Database.Seed.PipelineData;

public sealed record UserAddress
{
    public required City City { get; init; }

    public required string PostalCode { get; init; }
}