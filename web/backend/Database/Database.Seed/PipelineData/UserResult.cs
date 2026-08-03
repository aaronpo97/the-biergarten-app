namespace Database.Seed.PipelineData;

public sealed record UserResult
{
    public required string FirstName { get; init; }

    public required string LastName { get; init; }

    public required string Gender { get; init; }

    public required string Username { get; init; }

    public required string Bio { get; init; }

    public required float ActivityWeight { get; init; }
}