namespace Database.Seed.PipelineData;

public sealed record BreweryAddress
{
    public required City City { get; init; }

    public required double Longitude { get; init; }

    public required double Latitude { get; init; }

    public required string AddressLine1 { get; init; }

    public required string PostalCode { get; init; }
}
