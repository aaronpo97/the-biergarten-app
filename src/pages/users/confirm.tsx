import useConfirmUser from '@/hooks/auth/useConfirmUser';
import createErrorToast from '@/util/createErrorToast';
import Head from 'next/head';

import { FC, useState } from 'react';
import { toast } from 'react-hot-toast';

const ConfirmUserPage: FC = () => {
  const { needsToLogin, tokenInvalid } = useConfirmUser();

  const [confirmationResent, setConfirmationResent] = useState(false);
  const onClick = async () => {
    const resentConfirmationLoadingToast = toast.loading(
      'Resending your confirmation email.',
    );
    try {
      const response = await fetch('/api/users/resend-confirmation', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Something went wrong.');
      }

      toast.remove(resentConfirmationLoadingToast);
      toast.success('Sent a new confirmation email.');

      setConfirmationResent(true);
    } catch (err) {
      createErrorToast(err);
    }
  };

  return (
    <>
      <Head>
        <title>Confirm User | The Biergarten App</title>
      </Head>
      <div className="flex h-full flex-col items-center justify-center space-y-4">
        {needsToLogin && (
          <p className="text-center text-xl font-bold">
            Please login to confirm your account.
          </p>
        )}

        {!needsToLogin && tokenInvalid && !confirmationResent && (
          <>
            <p className="text-center text-2xl font-bold">
              Your confirmation token is invalid or is expired.
            </p>
            <button
              className="btn-outline btn-sm btn normal-case"
              onClick={onClick}
              type="button"
            >
              Click here to request a new token.
            </button>
          </>
        )}

        {!needsToLogin && tokenInvalid && confirmationResent && (
          <>
            <p className="text-center text-2xl font-bold">
              Resent your confirmation link.
            </p>
            <p className="font-xl text-center">Please check your email.</p>
          </>
        )}
      </div>
    </>
  );
};

export default ConfirmUserPage;
