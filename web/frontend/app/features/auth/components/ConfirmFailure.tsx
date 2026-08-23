import { Link } from 'react-router';

interface ConfirmFailureProps {
    error: string;
}

const ConfirmFailure = ({ error }: ConfirmFailureProps) => (
    <>
        <div className="text-error text-6xl">✕</div>
        <h1 className="card-title text-2xl">Confirmation Failed</h1>
        <div role="alert" className="alert alert-error alert-soft w-full">
            <span>{error}</span>
        </div>
        <p className="text-base-content/70 text-sm">
            The confirmation link may have expired (valid for 30 minutes) or already been used.
        </p>
        <div className="card-actions w-full pt-2 flex-col gap-2">
            <Link to="/dashboard" className="btn btn-primary w-full">
                Back to Dashboard
            </Link>
        </div>
    </>
);

export default ConfirmFailure;
