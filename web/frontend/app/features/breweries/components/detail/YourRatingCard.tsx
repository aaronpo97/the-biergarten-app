import StarRating from '../shared/StarRating';

interface YourRatingCardProps {
    value: number;
    onChange: (value: number) => void;
}

const YourRatingCard = ({ value, onChange }: YourRatingCardProps) => (
    <div className="card bg-base-100 shadow">
        <div className="card-body flex-row flex-wrap items-center justify-between gap-4 p-6">
            <div className="flex flex-col gap-0.5">
                <h3 className="text-xl m-0">Your rating</h3>
                <p className="text-sm text-base-content/60 m-0">
                    {value
                        ? `You rated this ${value} of 5. Tap the same star to clear.`
                        : 'Tap a star to rate this brewery.'}
                </p>
            </div>
            <StarRating value={value} onChange={onChange} size="lg" />
        </div>
    </div>
);

export default YourRatingCard;
