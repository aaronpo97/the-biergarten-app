import { useEffect } from 'react';
import { Link } from 'react-router';
import { showErrorToast, showSuccessToast } from '../components/toast/toast';
import { confirmEmail, requireAuth } from '../lib/auth.server';
import type { Route } from './+types/confirm';

export function meta({}: Route.MetaArgs) {
   return [{ title: 'Confirm Email | The Biergarten App' }];
}

export async function loader({ request }: Route.LoaderArgs) {
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
}

export default function Confirm({ loaderData }: Route.ComponentProps) {
   useEffect(() => {
      if (loaderData.success) {
         showSuccessToast('Email confirmed successfully.');
         return;
      }

      showErrorToast(loaderData.error);
   }, [loaderData]);

   return (
      <div className="hero min-h-screen bg-base-200">
         <div className="card w-full max-w-md bg-base-100 shadow-xl">
            <div className="card-body items-center text-center gap-4">
               {loaderData.success ? (
                  <>
                     <div className="text-success text-6xl">✓</div>
                     <h1 className="card-title text-2xl">Email Confirmed!</h1>
                     <p className="text-base-content/70">
                        Your email address has been successfully verified.
                     </p>
                     <div className="bg-base-200 rounded-box w-full p-3 text-sm text-left">
                        <span className="text-base-content/50 text-xs uppercase tracking-widest font-semibold">
                           Confirmed at
                        </span>
                        <p className="font-mono mt-1">
                           {new Date(loaderData.confirmedDate).toLocaleString()}
                        </p>
                     </div>
                     <div className="card-actions w-full pt-2">
                        <Link to="/dashboard" className="btn btn-primary w-full">
                           Go to Dashboard
                        </Link>
                     </div>
                  </>
               ) : (
                  <>
                     <div className="text-error text-6xl">✕</div>
                     <h1 className="card-title text-2xl">Confirmation Failed</h1>
                     <div role="alert" className="alert alert-error alert-soft w-full">
                        <span>{loaderData.error}</span>
                     </div>
                     <p className="text-base-content/70 text-sm">
                        The confirmation link may have expired (valid for 30 minutes) or already
                        been used.
                     </p>
                     <div className="card-actions w-full pt-2 flex-col gap-2">
                        <Link to="/dashboard" className="btn btn-primary w-full">
                           Back to Dashboard
                        </Link>
                     </div>
                  </>
               )}
            </div>
         </div>
      </div>
   );
}
