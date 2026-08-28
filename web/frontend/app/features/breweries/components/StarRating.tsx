import { useId } from 'react';

interface StarRatingProps {
    value: number;
    max?: number;
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    onChange?: (value: number) => void;
    label?: string;
}

const SIZE_CLASS: Record<NonNullable<StarRatingProps['size']>, string> = {
    xs: 'rating-xs',
    sm: 'rating-sm',
    md: 'rating-md',
    lg: 'rating-lg',
    xl: 'rating-xl',
};

/** Read-only when `onChange` is omitted, interactive otherwise. Clicking the
 * currently-selected star clears the rating (daisyUI radios can't do this natively). */
const StarRating = ({ value, max = 5, size = 'sm', onChange, label }: StarRatingProps) => {
    const name = useId();
    const stars = Array.from({ length: max }, (_, i) => i + 1);

    if (!onChange) {
        return (
            <div
                className={`rating ${SIZE_CLASS[size]}`}
                aria-label={label ?? `${value} out of ${max} stars`}
            >
                {stars.map((n) => (
                    <div
                        key={n}
                        className="mask mask-star bg-warning"
                        aria-label={`${n} star`}
                        aria-current={n === value ? 'true' : undefined}
                    />
                ))}
            </div>
        );
    }

    return (
        <div className={`rating ${SIZE_CLASS[size]}`}>
            <input
                type="radio"
                name={name}
                className="rating-hidden"
                checked={value === 0}
                onChange={() => onChange(0)}
                aria-label="Clear rating"
            />
            {stars.map((n) => (
                <input
                    key={n}
                    type="radio"
                    name={name}
                    className="mask mask-star bg-warning"
                    checked={value === n}
                    onChange={() => onChange(n)}
                    onClick={() => {
                        if (value === n) onChange(0);
                    }}
                    aria-label={`Rate ${n} of ${max}`}
                />
            ))}
        </div>
    );
};

export default StarRating;
