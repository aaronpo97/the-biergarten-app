import { confirmEmail, requireAuth } from '../auth.server';
import ConfirmFailure from '../components/ConfirmFailure';
import ConfirmSuccess from '../components/ConfirmSuccess';
import type { Route } from './+types/confirm';

export const meta = ({}: Route.MetaArgs) => {
    return [{ title: 'Confirm Email | The Biergarten App' }];
};

export const loader = async ({ request }: Route.LoaderArgs) => {
    const auth = await requireAuth(request);
    const url = new URL(request.url);
    const token = url.searchParams.get('token');

    if (!token) {
        return { success: false as const, error: 'Missing confirmation token.' };
    }

    try {
        const payload = await confirmEmail(token, auth.accessToken);
        return {
            success: true as const,
            confirmedDate: payload.confirmedDate,
        };
    } catch (err) {
        return {
            success: false as const,
            error: err instanceof Error ? err.message : 'Confirmation failed.',
        };
    }
};

const Confirm = ({ loaderData }: Route.ComponentProps) => {
    return (
        <div className="hero min-h-screen bg-base-200">
            <div className="card w-full max-w-md bg-base-100 shadow-xl">
                <div className="card-body items-center text-center gap-4">
                    {loaderData.success ? (
                        <ConfirmSuccess confirmedDate={loaderData.confirmedDate} />
                    ) : (
                        <ConfirmFailure error={loaderData.error} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Confirm;
