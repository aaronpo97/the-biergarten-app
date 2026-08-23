import { Link } from 'react-router';

interface SessionInfoCardProps {
    username: string;
    userAccountId: string;
}

const SessionInfoCard = ({ username, userAccountId }: SessionInfoCardProps) => (
    <div className="card bg-base-100 shadow">
        <div className="card-body">
            <h2 className="card-title text-2xl">Welcome, {username}!</h2>
            <p className="text-base-content/70">
                You are successfully authenticated. This is a protected page that requires a valid
                session.
            </p>

            <div className="bg-base-200 rounded-box p-4 mt-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-base-content/50 mb-3">
                    Session Info
                </p>
                <div className="stats stats-vertical w-full">
                    <div className="stat py-2">
                        <div className="stat-title">Username</div>
                        <div className="stat-value text-lg font-mono">{username}</div>
                    </div>
                    <div className="stat py-2">
                        <div className="stat-title">User ID</div>
                        <div className="stat-desc font-mono text-xs mt-1">{userAccountId}</div>
                    </div>
                </div>
            </div>

            <div className="card-actions mt-4">
                <Link to="/account" className="btn btn-outline btn-sm">
                    Account Settings
                </Link>
            </div>
        </div>
    </div>
);

export default SessionInfoCard;
