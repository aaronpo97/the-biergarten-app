import { redirect } from 'react-router';
import { destroySession, getSession } from '../auth.server';
import type { Route } from './+types/logout';

export async function loader({ request }: Route.LoaderArgs) {
    const session = await getSession(request);
    return redirect('/', {
        headers: { 'Set-Cookie': await destroySession(session) },
    });
}
