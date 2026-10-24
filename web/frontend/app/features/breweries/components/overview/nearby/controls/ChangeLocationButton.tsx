interface ChangeLocationButtonProps {
    onClick: () => void;
}

const ChangeLocationButton = ({ onClick }: ChangeLocationButtonProps) => {
    return (
        <div className="pt-1">
            <button type="button" onClick={onClick} className="btn btn-ghost btn-sm -ml-3">
                Change location
            </button>
        </div>
    );
};

export default ChangeLocationButton;
