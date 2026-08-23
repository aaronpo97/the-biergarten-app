import { requireAuth } from '../../auth/auth.server';
import AuthFlowDemoCard from '../components/AuthFlowDemoCard';
import SessionInfoCard from '../components/SessionInfoCard';
import type { Route } from './+types/dashboard';

export const meta = ({}: Route.MetaArgs) => {
    return [{ title: 'Dashboard | The Biergarten App' }];
};

export const loader = async ({ request }: Route.LoaderArgs) => {
    const auth = await requireAuth(request);
    return {
        username: auth.username,
        userAccountId: auth.userAccountId,
    };
};

const Dashboard = ({ loaderData }: Route.ComponentProps) => {
    const { username, userAccountId } = loaderData;

    return (
        <div className="min-h-screen bg-base-200">
            <div className="mx-auto max-w-4xl px-6 py-10 space-y-6">
                <SessionInfoCard username={username} userAccountId={userAccountId} />
                <AuthFlowDemoCard />
            </div>
        </div>
    );
};

export default Dashboard;
