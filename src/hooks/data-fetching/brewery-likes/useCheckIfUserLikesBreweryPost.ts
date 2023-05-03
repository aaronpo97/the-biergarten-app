import UserContext from '@/contexts/userContext';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { useContext } from 'react';
import useSWR from 'swr';
import { z } from 'zod';

const useCheckIfUserLikesBreweryPost = (breweryPostId: string) => {
  const { user } = useContext(UserContext);
  const { data, error, isLoading, mutate } = useSWR(
    `/api/breweries/${breweryPostId}/like/is-liked`,
    async () => {
      if (!user) {
        throw new Error('User is not logged in.');
      }

      const response = await fetch(`/api/breweries/${breweryPostId}/like/is-liked`);
      const json = await response.json();
      const parsed = APIResponseValidationSchema.safeParse(json);

      if (!parsed.success) {
        throw new Error('Invalid API response.');
      }

      const { payload } = parsed.data;
      const parsedPayload = z.object({ isLiked: z.boolean() }).safeParse(payload);

      if (!parsedPayload.success) {
        throw new Error('Invalid API response.');
      }

      const { isLiked } = parsedPayload.data;

      return isLiked;
    },
  );

  return {
    isLiked: data,
    error: error as unknown,
    isLoading,
    mutate,
  };
};

export default useCheckIfUserLikesBreweryPost;
