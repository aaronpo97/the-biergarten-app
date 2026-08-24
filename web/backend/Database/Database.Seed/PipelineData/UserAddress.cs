namespace Database.Seed.PipelineData;

public sealed record UserAddress
{
    public required City City { get; init; }

    public required double Longitude { get; init; }

    public required double Latitude { get; init; }
}
