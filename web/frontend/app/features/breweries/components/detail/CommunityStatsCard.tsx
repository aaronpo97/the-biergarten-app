import SidebarCard from '../shared/SidebarCard';

interface CommunityStatsCardProps {
    likeCount: number;
    ratingsCount: number;
    commentCount: number;
}

const StatRow = ({ label, value }: { label: string; value: number }) => (
    <div className="flex items-center justify-between gap-2 text-sm">
        <span className="text-base-content/60">{label}</span>
        <span className="font-semibold tabular-nums">{value}</span>
    </div>
);

const CommunityStatsCard = ({ likeCount, ratingsCount, commentCount }: CommunityStatsCardProps) => (
    <SidebarCard title="Community">
        <StatRow label="Likes" value={likeCount} />
        <StatRow label="Ratings" value={ratingsCount} />
        <StatRow label="Comments" value={commentCount} />
    </SidebarCard>
);

export default CommunityStatsCard;
