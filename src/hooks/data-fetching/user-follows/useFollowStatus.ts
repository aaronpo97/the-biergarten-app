import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import useSWR from 'swr';
import { z } from 'zod';

const useFollowStatus = (userFollowedId: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/users/${userFollowedId}/is-followed`,
    async (url) => {
      const response = await fetch(url);
      const json = await response.json();
      const parsed = APIResponseValidationSchema.safeParse(json);

      if (!parsed.success) {
        throw new Error('Invalid API response.');
      }

      const { payload } = parsed.data;
      const parsedPayload = z.object({ isFollowed: z.boolean() }).safeParse(payload);

      if (!parsedPayload.success) {
        throw new Error('Invalid API response.');
      }

      const { isFollowed } = parsedPayload.data;

      return isFollowed;
    },
  );

  return {
    isFollowed: data,
    error: error as unknown,
    isLoading,
    mutate,
  };
};

export default useFollowStatus;
