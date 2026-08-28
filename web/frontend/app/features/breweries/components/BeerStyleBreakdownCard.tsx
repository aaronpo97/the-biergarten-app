import SidebarCard from './SidebarCard';
import type { FillerBeer } from '../utils/filler-brewery-detail';

interface BeerStyleBreakdownCardProps {
    beers: FillerBeer[];
}

const BeerStyleBreakdownCard = ({ beers }: BeerStyleBreakdownCardProps) => {
    const counts = new Map<string, number>();
    beers.forEach((beer) => counts.set(beer.style, (counts.get(beer.style) ?? 0) + 1));
    const maxCount = Math.max(...counts.values());
    const styles = [...counts.entries()].sort((a, b) => b[1] - a[1]);

    return (
        <SidebarCard title="Beer styles">
            {styles.map(([style, count]) => (
                <div key={style} className="flex flex-col gap-1">
                    <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-semibold">{style}</span>
                        <span className="text-xs text-base-content/60 tabular-nums">{count}</span>
                    </div>
                    <progress
                        className="progress progress-primary h-1.5"
                        value={count}
                        max={maxCount}
                    />
                </div>
            ))}
        </SidebarCard>
    );
};

export default BeerStyleBreakdownCard;
