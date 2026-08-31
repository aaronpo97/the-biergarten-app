using MediatR;

namespace Features.Auth.Commands.Profile.CreateUserProfile;

/// <summary>Creates a new user profile for a user account.</summary>
public record CreateUserProfileCommand(Guid UserAccountId, string Biography) : IRequest<Guid>;
