import SidebarCard from '../shared/SidebarCard';

interface BreweryDetailsCardProps {
    foundedYear: number;
    type: string;
    beerCount: number;
}

const DetailRow = ({ label, value }: { label: string; value: string | number }) => (
    <div className="flex items-center justify-between gap-2 text-sm">
        <span className="text-base-content/60">{label}</span>
        <span className="font-semibold">{value}</span>
    </div>
);

const BreweryDetailsCard = ({ foundedYear, type, beerCount }: BreweryDetailsCardProps) => (
    <SidebarCard title="Details">
        <DetailRow label="Founded" value={foundedYear} />
        <DetailRow label="Type" value={type} />
        <DetailRow label="Beers listed" value={beerCount} />
    </SidebarCard>
);

export default BreweryDetailsCard;
