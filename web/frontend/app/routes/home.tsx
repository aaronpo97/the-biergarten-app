import { Link } from 'react-router';
import { getOptionalAuth } from '../lib/auth.server';
import type { Route } from './+types/home';

export const meta = ({}: Route.MetaArgs) => [
    { title: 'The Biergarten App' },
    { name: 'description', content: 'Welcome to The Biergarten App' },
];

export const loader = async ({ request }: Route.LoaderArgs) => {
    const auth = await getOptionalAuth(request);
    return { username: auth?.username ?? null };
};

export default function Home({ loaderData }: Route.ComponentProps) {
    const { username } = loaderData;

    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="hero-content text-center">
                <div className="max-w-md space-y-6">
                    <h1 className="text-5xl font-bold">🍺 The Biergarten App</h1>
                    <p className="text-lg text-base-content/70">Authentication Demo</p>

                    {username ? (
                        <>
                            <p className="text-base-content/80">
                                Welcome back,{' '}
                                <span className="font-semibold text-primary">{username}</span>!
                            </p>
                            <div className="flex gap-3 justify-center">
                                <Link to="/dashboard" className="btn btn-primary">
                                    Dashboard
                                </Link>
                                <Link to="/logout" className="btn btn-ghost">
                                    Logout
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="flex gap-3 justify-center">
                            <Link to="/login" className="btn btn-primary">
                                Login
                            </Link>
                            <Link to="/register" className="btn btn-outline">
                                Register
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
