import UserContext from '@/contexts/UserContext';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { useRouter } from 'next/router';
import { useState, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import useSWR from 'swr';

/**
 * A custom hook to confirm a user's account.
 *
 * @returns An object with the following properties:
 *
 *   - `needsToLogin`: A boolean indicating whether the user needs to log in.
 *   - `tokenInvalid`: A boolean indicating whether the token is invalid.
 */
const useConfirmUser = () => {
  const router = useRouter();
  const { user, mutate } = useContext(UserContext);
  const token = router.query.token as string | undefined;
  const [needsToLogin, setNeedsToLogin] = useState(false);
  const [tokenInvalid, setTokenInvalid] = useState(false);

  const fetcher = async <T extends string>(url: T) => {
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

    mutate!();
    return parsed.data;
  };

  const { data, error } = useSWR(`/api/users/confirm?token=${token}`, fetcher);

  useEffect(() => {
    const loadingToast = toast.loading('Attempting to confirm your account.');
    if (user && user.accountIsVerified) {
      toast.remove(loadingToast);
      router.replace('/users/current');
      toast('Your account is already verified.');
    }
    if (!token) {
      toast.remove(loadingToast);
      setTokenInvalid(true);
      setNeedsToLogin(false);
    }
    if (user && !user.accountIsVerified && !data) {
      toast.remove(loadingToast);
      setTokenInvalid(true);
      setNeedsToLogin(false);
    }

    if (error instanceof Error && error.message === 'Unauthorized') {
      toast.remove(loadingToast);
      setTokenInvalid(false);
      setNeedsToLogin(true);
    }

    return () => {
      toast.remove(loadingToast);
    };
  }, [error, data, router, user, token]);

  return { needsToLogin, tokenInvalid };
};

export default useConfirmUser;
