import FollowInfoSchema from '@/services/UserFollows/schema/FollowInfoSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import useSWRInfinite from 'swr/infinite';
import { z } from 'zod';

const useGetUsersFollowedByUser = ({
  pageSize,
  userId,
}: {
  pageSize: number;
  userId: string;
}) => {
  const fetcher = async (url: string) => {
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

  const { data, error, isLoading, setSize, size } = useSWRInfinite(
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
    error: error as unknown,
  };
};

export default useGetUsersFollowedByUser;
