import { Link } from 'react-router';

const AuthFlowDemoCard = () => (
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
                            POST to <code className="kbd kbd-sm">/api/auth/login</code> with
                            username &amp; password
                        </p>
                    </div>
                </li>
                <li className="list-row">
                    <div>
                        <p className="font-semibold">Register</p>
                        <p className="text-sm text-base-content/60">
                            POST to <code className="kbd kbd-sm">/api/auth/register</code> with
                            full user details
                        </p>
                    </div>
                </li>
                <li className="list-row">
                    <div>
                        <p className="font-semibold">Session</p>
                        <p className="text-sm text-base-content/60">
                            JWT access &amp; refresh tokens stored in an HTTP-only cookie
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
                            POST to <code className="kbd kbd-sm">/api/auth/refresh</code> with the
                            refresh token in an <code className="kbd kbd-sm">X-Refresh-Token</code>{' '}
                            header
                        </p>
                    </div>
                </li>
                <li className="list-row">
                    <div>
                        <p className="font-semibold">Account Management</p>
                        <p className="text-sm text-base-content/60">
                            PATCH <code className="kbd kbd-sm">/api/auth/username</code>,{' '}
                            <code className="kbd kbd-sm">/email</code>,{' '}
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
);

export default AuthFlowDemoCard;
