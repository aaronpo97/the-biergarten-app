namespace Database.Seed.PipelineData;

public sealed record UserRecord
{
    public required UserAddress Address { get; init; }

    public required UserResult User { get; init; }

    public required string Email { get; init; }

    public required string DateOfBirth { get; init; }
}