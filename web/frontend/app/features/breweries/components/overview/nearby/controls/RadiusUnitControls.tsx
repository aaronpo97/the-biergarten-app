import { formatDistance, type DistanceUnit } from '../../../../utils/distance';

const MIN_RADIUS_KM = 10;
const MAX_RADIUS_KM = 300;
const RADIUS_STEP_KM = 10;

interface RadiusUnitControlsProps {
    radiusKm: number;
    unit: DistanceUnit;
    onRadiusChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSelectKm: () => void;
    onSelectMi: () => void;
}

const RadiusUnitControls = ({
    radiusKm,
    unit,
    onRadiusChange,
    onSelectKm,
    onSelectMi,
}: RadiusUnitControlsProps) => {
    return (
        <div className="flex items-center justify-between gap-3">
            <label className="flex-1 flex flex-col gap-1 text-sm text-base-content/70">
                <span className="flex justify-between">
                    <span>Search radius</span>
                    <span className="font-semibold">{formatDistance(radiusKm * 1000, unit)}</span>
                </span>
                <input
                    type="range"
                    min={MIN_RADIUS_KM}
                    max={MAX_RADIUS_KM}
                    step={RADIUS_STEP_KM}
                    value={radiusKm}
                    onChange={onRadiusChange}
                    className="range range-primary range-sm"
                />
            </label>
            <div className="join self-end">
                <button
                    type="button"
                    onClick={onSelectKm}
                    className={`btn btn-xs join-item ${unit === 'km' ? 'btn-active' : ''}`}
                >
                    km
                </button>
                <button
                    type="button"
                    onClick={onSelectMi}
                    className={`btn btn-xs join-item ${unit === 'mi' ? 'btn-active' : ''}`}
                >
                    mi
                </button>
            </div>
        </div>
    );
};

export default RadiusUnitControls;
