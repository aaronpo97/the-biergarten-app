const EmptyState = ({ message }: { message: string }) => (
    <div className="card bg-base-100 shadow">
        <div className="card-body items-center py-12">
            <p className="text-sm text-base-content/60 text-center m-0">{message}</p>
        </div>
    </div>
);

export default EmptyState;
