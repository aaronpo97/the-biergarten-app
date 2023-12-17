/**
 * A custom hook to fetch the users followed by a given user.
 *
 * @param options - The options for fetching users.
 * @param [options.pageSize=5] - The number of users to fetch per page. Default is `5`
 * @param options.userId - The ID of the user.
 * @returns An object with the following properties:
 *
 *   - `following` The list of users followed by the specified user.
 *   - `followingCount` The total count of users followed by the specified user.
 *   - `pageCount` The total number of pages.
 *   - `size` The current page size.
 *   - `setSize` A function to set the page size.
 *   - `isLoading` Indicates if the data is currently being loaded.
 *   - `isLoadingMore` Indicates if there are more pages to load.
 *   - `isAtEnd` Indicates if the current page is the last page.
 *   - `mutate` A function to mutate the data.
 *   - `error` The error object, if any.
 */
import FollowInfoSchema from '@/services/users/profile/schema/FollowInfoSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import useSWRInfinite from 'swr/infinite';
import { z } from 'zod';

const useGetUsersFollowedByUser = ({
  pageSize = 5,
  userId,
}: {
  pageSize?: number;
  userId: string | undefined;
}) => {
  const fetcher = async (url: string) => {
    if (!userId) {
      throw new Error('User ID is undefined');
    }
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const json = await response.json();
    const count = response.headers.get('X-Total-Count');

    const parsed = APIResponseValidationSchema.safeParse(json);
    if (!parsed.success) {
      throw new Error('API response validation failed');
    }

    const parsedPayload = z.array(FollowInfoSchema).safeParse(parsed.data.payload);
    if (!parsedPayload.success) {
      throw new Error('API response validation failed');
    }

    const pageCount = Math.ceil(parseInt(count as string, 10) / pageSize);

    return { following: parsedPayload.data, pageCount, followingCount: count };
  };

  const { data, error, isLoading, setSize, size, mutate } = useSWRInfinite(
    (index) =>
      `/api/users/${userId}/following?page_num=${index + 1}&page_size=${pageSize}`,
    fetcher,
    { parallel: true },
  );

  const following = data?.flatMap((d) => d.following) ?? [];
  const followingCount = data?.[0].followingCount ?? 0;

  const pageCount = data?.[0].pageCount ?? 0;
  const isLoadingMore = size > 0 && data && typeof data[size - 1] === 'undefined';
  const isAtEnd = !(size < data?.[0].pageCount!);

  return {
    following,
    followingCount,
    pageCount,
    size,
    setSize,
    isLoading,
    isLoadingMore,
    isAtEnd,
    mutate,
    error: error as unknown,
  };
};

export default useGetUsersFollowedByUser;
