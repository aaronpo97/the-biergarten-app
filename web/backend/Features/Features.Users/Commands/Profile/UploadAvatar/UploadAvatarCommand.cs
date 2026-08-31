using MediatR;
using Microsoft.AspNetCore.Http;

namespace Features.Auth.Commands.Profile.UploadAvatar;

/// <summary>Uploads a new avatar photo for a user account, replacing any existing avatar.</summary>
public record UploadAvatarCommand(Guid UserAccountId, IFormFile File) : IRequest<Guid>;
