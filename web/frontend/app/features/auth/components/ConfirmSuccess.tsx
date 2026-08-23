import { Link } from 'react-router';

interface ConfirmSuccessProps {
    confirmedDate: string;
}

const ConfirmSuccess = ({ confirmedDate }: ConfirmSuccessProps) => (
    <>
        <div className="text-success text-6xl">✓</div>
        <h1 className="card-title text-2xl">Email Confirmed!</h1>
        <p className="text-base-content/70">Your email address has been successfully verified.</p>
        <div className="bg-base-200 rounded-box w-full p-3 text-sm text-left">
            <span className="text-base-content/50 text-xs uppercase tracking-widest font-semibold">
                Confirmed at
            </span>
            <p className="font-mono mt-1">{new Date(confirmedDate).toLocaleString()}</p>
        </div>
        <div className="card-actions w-full pt-2">
            <Link to="/dashboard" className="btn btn-primary w-full">
                Go to Dashboard
            </Link>
        </div>
    </>
);

export default ConfirmSuccess;
