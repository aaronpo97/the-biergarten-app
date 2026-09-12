import EmptyState from '../EmptyState';
import StarRating from '../../../../breweries/components/shared/StarRating';
import type { FillerLiked } from '../../../utils/filler-user-profile';

interface LikedTabProps {
    liked: FillerLiked[];
}

const LikedTab = ({ liked }: LikedTabProps) => {
    if (liked.length === 0) {
        return <EmptyState message="No likes yet." />;
    }

    return (
        <div className="grid grid-cols-2 gap-4">
            {liked.map((item) => (
                <div key={item.id} className="card bg-base-100 shadow overflow-hidden">
                    <div className="h-[120px] bg-base-300" />
                    <div className="card-body p-4 gap-1">
                        <p className="font-serif font-bold m-0">{item.name}</p>
                        <p className="text-sm text-base-content/60 m-0">{item.meta}</p>
                        <div className="mt-1">
                            <StarRating value={item.rating} size="xs" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LikedTab;
