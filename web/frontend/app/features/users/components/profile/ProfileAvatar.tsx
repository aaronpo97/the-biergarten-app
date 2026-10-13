import { useState } from 'react';

interface ProfileAvatarProps {
    avatarUrl: string;
    displayName: string;
}

/**
 * Renders the user's current avatar photo, falling back to their initials when the public
 * profile payload carries an empty `avatarUrl` or the hosted image fails to load.
 */
const ProfileAvatar = ({ avatarUrl, displayName }: ProfileAvatarProps) => {
    const [didImageFail, setDidImageFail] = useState(false);
    const showPhoto = avatarUrl.length > 0 && !didImageFail;

    return (
        <div
            className={`avatar w-[120px] h-[120px] rounded-full border-4 border-base-200 shadow-md ${
                showPhoto ? '' : 'avatar-placeholder'
            }`}
        >
            {showPhoto ? (
                <div className="w-full h-full rounded-full overflow-hidden">
                    <img
                        src={avatarUrl}
                        alt={`${displayName}'s avatar`}
                        className="w-full h-full object-cover"
                        onError={() => setDidImageFail(true)}
                    />
                </div>
            ) : (
                <div className="bg-secondary text-secondary-content w-full h-full rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold">
                        {displayName.slice(0, 2).toUpperCase()}
                    </span>
                </div>
            )}
        </div>
    );
};

export default ProfileAvatar;
