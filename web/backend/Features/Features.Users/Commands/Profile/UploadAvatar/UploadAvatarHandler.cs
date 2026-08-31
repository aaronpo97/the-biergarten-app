using Domain.Entities;
using Features.Auth.Repository;
using Features.ImageUploads.Commands.UploadPhoto;
using MediatR;

namespace Features.Auth.Commands.Profile.UploadAvatar;

/// <summary>
///     Handles <see cref="UploadAvatarCommand" />: uploads the photo via <see cref="UploadPhotoCommand" />,
///     then saves the <see cref="UserAvatar" /> record, replacing any existing avatar for the user.
/// </summary>
public class UploadAvatarHandler(IMediator mediator, IUserProfileRepository userProfileRepository)
    : IRequestHandler<UploadAvatarCommand, Guid>
{
    public async Task<Guid> Handle(UploadAvatarCommand request, CancellationToken cancellationToken)
    {
        Guid photoId = await mediator.Send(
            new UploadPhotoCommand(
                request.UserAccountId,
                $"avatars/{request.UserAccountId}",
                request.File
            ),
            cancellationToken
        );

        Guid profileId = await userProfileRepository.GetProfileIdAsync(
            request.UserAccountId,
            cancellationToken
        );

        UserAvatar avatar = new()
        {
            UserAvatarId = Guid.NewGuid(),
            UserProfileId = profileId,
            PhotoId = photoId,
        };

        await userProfileRepository.SaveAvatarAsync(avatar, cancellationToken);

        return photoId;
    }
}
