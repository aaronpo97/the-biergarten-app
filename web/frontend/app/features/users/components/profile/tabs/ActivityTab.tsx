import { ChatBubble, Heart, Star } from 'iconoir-react';
import EmptyState from '../EmptyState';
import StarRating from '../../../../breweries/components/shared/StarRating';
import type { FillerActivity } from '../../../utils/filler-user-profile';

const ICONS = { star: Star, heart: Heart, comment: ChatBubble } as const;

interface ActivityTabProps {
    activity: FillerActivity[];
}

const ActivityTab = ({ activity }: ActivityTabProps) => {
    if (activity.length === 0) {
        return (
            <EmptyState message="No activity yet. Ratings, likes, and comments will show up here." />
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {activity.map((item) => {
                const Icon = ICONS[item.icon];
                return (
                    <div key={item.id} className="card bg-base-100 shadow">
                        <div className="card-body flex-row gap-4 items-start p-4">
                            <div className="w-[34px] h-[34px] rounded-full bg-accent text-accent-content flex items-center justify-center shrink-0">
                                <Icon className="size-4" aria-hidden="true" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm leading-normal m-0">
                                    {item.verb} <span className="font-semibold">{item.target}</span>
                                </p>
                                {item.rating !== undefined && (
                                    <div className="mt-1.5">
                                        <StarRating value={item.rating} size="xs" />
                                    </div>
                                )}
                                {item.comment && (
                                    <p className="text-sm text-base-content/60 italic mt-1.5 mb-0">
                                        &ldquo;{item.comment}&rdquo;
                                    </p>
                                )}
                                <p className="text-xs text-base-content/60 mt-1.5 mb-0">
                                    {item.time}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ActivityTab;
