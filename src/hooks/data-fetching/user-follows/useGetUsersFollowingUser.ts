import FollowInfoSchema from '@/services/UserFollows/schema/FollowInfoSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import useSWRInfinite from 'swr/infinite';
import { z } from 'zod';

interface UseGetUsersFollowingUser {
  pageSize?: number;
  userId?: string;
}

/**
 * A custom hook to fetch users following a user.
 *
 * @param options - The options for fetching users.
 * @param [options.pageSize=5] - The number of users to fetch per page. Default is `5`
 * @param options.userId - The ID of the user.
 * @returns An object with the following properties:
 *
 *   - `followers` The list of users following the specified user.
 *   - `followerCount` The total count of users following the specified user.
 *   - `pageCount` The total number of pages.
 *   - `size` The current page size.
 *   - `setSize` A function to set the page size.
 *   - `isLoading` Indicates if the data is currently being loaded.
 *   - `isLoadingMore` Indicates if there are more pages to load.
 *   - `isAtEnd` Indicates if the current page is the last page.
 *   - `mutate` A function to mutate the data.
 *   - `error` The error object, if any.
 */

const useGetUsersFollowingUser = ({ pageSize = 5, userId }: UseGetUsersFollowingUser) => {
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

    return { followers: parsedPayload.data, pageCount, followerCount: count };
  };

  const { data, error, isLoading, setSize, size, mutate } = useSWRInfinite(
    (index) =>
      `/api/users/${userId}/followers?page_num=${index + 1}&page_size=${pageSize}`,
    fetcher,
    { parallel: true },
  );

  const followers = data?.flatMap((d) => d.followers) ?? [];
  const followerCount = data?.[0].followerCount ?? 0;

  const pageCount = data?.[0].pageCount ?? 0;
  const isLoadingMore = size > 0 && data && typeof data[size - 1] === 'undefined';
  const isAtEnd = !(size < data?.[0].pageCount!);

  return {
    followers,
    followerCount,
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

export default useGetUsersFollowingUser;
