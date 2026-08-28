using MediatR;
using Microsoft.AspNetCore.Http;

namespace Features.ImageUploads.Commands.UploadPhoto;

/// <summary>
///     Uploads a new photo to storage under <c>{Key}/{generated photo id}</c> and records it. Sent by
///     other features' handlers (e.g. a brewery photo upload command) rather than bound from a request
///     directly, since this feature exposes no controller of its own.
/// </summary>
public record UploadPhotoCommand(Guid UploadedById, string Key, IFormFile File) : IRequest<Guid>;
