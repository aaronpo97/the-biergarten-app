import { Link } from 'react-router';
import { requireAuth } from '../../auth/auth.server';
import type { Route } from './+types/dashboard';

export function meta({}: Route.MetaArgs) {
    return [{ title: 'Dashboard | The Biergarten App' }];
}

export async function loader({ request }: Route.LoaderArgs) {
    const auth = await requireAuth(request);
    return {
        username: auth.username,
        userAccountId: auth.userAccountId,
    };
}

const Dashboard = ({ loaderData }: Route.ComponentProps) => {
    const { username, userAccountId } = loaderData;

    return (
        <div className="min-h-screen bg-base-200">
            <div className="mx-auto max-w-4xl px-6 py-10 space-y-6">
                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <h2 className="card-title text-2xl">Welcome, {username}!</h2>
                        <p className="text-base-content/70">
                            You are successfully authenticated. This is a protected page that
                            requires a valid session.
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
                                    <div className="stat-desc font-mono text-xs mt-1">
                                        {userAccountId}
                                    </div>
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

                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <h2 className="card-title">Auth Flow Demo</h2>
                        <p className="text-sm text-base-content/70">
                            This demo showcases the following authentication features:
                        </p>
                        <ul className="list">
                            <li className="list-row">
                                <div>
                                    <p className="font-semibold">Login</p>
                                    <p className="text-sm text-base-content/60">
                                        POST to <code className="kbd kbd-sm">/api/auth/login</code>{' '}
                                        with username &amp; password
                                    </p>
                                </div>
                            </li>
                            <li className="list-row">
                                <div>
                                    <p className="font-semibold">Register</p>
                                    <p className="text-sm text-base-content/60">
                                        POST to{' '}
                                        <code className="kbd kbd-sm">/api/auth/register</code> with
                                        full user details
                                    </p>
                                </div>
                            </li>
                            <li className="list-row">
                                <div>
                                    <p className="font-semibold">Session</p>
                                    <p className="text-sm text-base-content/60">
                                        JWT access &amp; refresh tokens stored in an HTTP-only
                                        cookie
                                    </p>
                                </div>
                            </li>
                            <li className="list-row">
                                <div>
                                    <p className="font-semibold">Protected Routes</p>
                                    <p className="text-sm text-base-content/60">
                                        This dashboard requires authentication via{' '}
                                        <code className="kbd kbd-sm">requireAuth()</code>
                                    </p>
                                </div>
                            </li>
                            <li className="list-row">
                                <div>
                                    <p className="font-semibold">Token Refresh</p>
                                    <p className="text-sm text-base-content/60">
                                        POST to{' '}
                                        <code className="kbd kbd-sm">/api/auth/refresh</code> with
                                        the refresh token in an{' '}
                                        <code className="kbd kbd-sm">X-Refresh-Token</code> header
                                    </p>
                                </div>
                            </li>
                            <li className="list-row">
                                <div>
                                    <p className="font-semibold">Account Management</p>
                                    <p className="text-sm text-base-content/60">
                                        PATCH <code className="kbd kbd-sm">/api/auth/username</code>
                                        , <code className="kbd kbd-sm">/email</code>,{' '}
                                        <code className="kbd kbd-sm">/password</code>,{' '}
                                        <code className="kbd kbd-sm">/profile</code>, and DELETE{' '}
                                        <code className="kbd kbd-sm">/account</code> — see{' '}
                                        <Link to="/account" className="link">
                                            Account Settings
                                        </Link>
                                    </p>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
