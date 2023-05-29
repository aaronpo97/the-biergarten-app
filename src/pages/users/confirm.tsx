import UserContext from '@/contexts/UserContext';
import createErrorToast from '@/util/createErrorToast';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { FC, useContext, useState } from 'react';
import { toast } from 'react-hot-toast';
import useSWR from 'swr';

const useSendConfirmUserRequest = () => {
  const router = useRouter();
  const token = router.query.token as string | undefined;

  const { data, error } = useSWR(`/api/users/confirm?token=${token}`, async (url) => {
    if (!token) {
      throw new Error('Token must be provided.');
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    const json = await response.json();

    const parsed = APIResponseValidationSchema.safeParse(json);

    if (!parsed.success) {
      throw new Error('API response validation failed.');
    }
    return parsed.data;
  });

  return { data, error: error as unknown };
};

const ConfirmUserPage: FC = () => {
  const router = useRouter();
  const { error, data } = useSendConfirmUserRequest();
  const { user } = useContext(UserContext);

  const needsToLogin =
    error instanceof Error && error.message === 'Unauthorized' && !user;
  const tokenExpired = error instanceof Error && error.message === 'Unauthorized' && user;
  const [confirmationResent, setConfirmationResent] = useState(false);

  if (user?.accountIsVerified) {
    router.push('/users/current');
    return null;
  }

  if (data) {
    router.push('/users/current');
    return null;
  }

  if (needsToLogin) {
    return (
      <>
        <Head>
          <title>Confirm User | The Biergarten App</title>
        </Head>
        <div className="flex h-full flex-col items-center justify-center">
          <p className="text-center text-xl font-bold">
            Please login to confirm your account.
          </p>
        </div>
      </>
    );
  }
  if (tokenExpired) {
    const onClick = async () => {
      const loadingToast = toast.loading('Resending your confirmation email.');
      try {
        const response = await fetch('/api/users/resend-confirmation', {
          method: 'POST',
        });
        if (!response.ok) {
          throw new Error('Something went wrong.');
        }

        toast.remove(loadingToast);
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
          {!confirmationResent ? (
            <>
              <p className="text-center text-2xl font-bold">
                Your confirmation token is expired.
              </p>
              <button
                className="btn-outline btn-sm btn normal-case"
                onClick={onClick}
                type="button"
              >
                Click here to request a new token.
              </button>
            </>
          ) : (
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
  }

  return null;
};

export default ConfirmUserPage;
