import CommentQueryResult from '@/services/schema/CommentSchema/CommentQueryResult';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { z } from 'zod';
import useSWRInfinite from 'swr/infinite';

interface UseBeerPostCommentsProps {
  pageNum: number;
  id: string;
  pageSize: number;
}

/**
 * A custom React hook that fetches comments for a specific beer post.
 *
 * @param props - The props object.
 * @param props.pageNum - The page number of the comments to fetch.
 * @param props.id - The ID of the beer post to fetch comments for.
 * @param props.pageSize - The number of comments to fetch per page.
 * @returns An object with the following properties:
 *
 *   - `comments`: The comments for the beer post.
 *   - `isLoading`: A boolean indicating whether the comments are being fetched.
 *   - `error`: The error that occurred while fetching the comments.
 *   - `mutate`: A function to mutate the comments.
 *   - `size`: The number of pages of comments that have been fetched.
 *   - `setSize`: A function to set the number of pages of comments that have been fetched.
 *   - `isLoadingMore`: A boolean indicating whether more comments are being fetched.
 *   - `isAtEnd`: A boolean indicating whether all comments have been fetched.
 *   - `pageCount`: The total number of pages of comments.
 */
const useBeerPostComments = ({ id, pageSize }: UseBeerPostCommentsProps) => {
  const fetcher = async (url: string) => {
    const response = await fetch(url);

    const json = await response.json();
    const count = response.headers.get('X-Total-Count');

    const parsed = APIResponseValidationSchema.safeParse(json);
    if (!parsed.success) {
      throw new Error(parsed.error.message);
    }

    const parsedPayload = z.array(CommentQueryResult).safeParse(parsed.data.payload);
    if (!parsedPayload.success) {
      throw new Error(parsedPayload.error.message);
    }

    const pageCount = Math.ceil(parseInt(count as string, 10) / pageSize);
    return { comments: parsedPayload.data, pageCount };
  };

  const { data, error, isLoading, mutate, size, setSize } = useSWRInfinite(
    (index) => `/api/beers/${id}/comments?page_num=${index + 1}&page_size=${pageSize}`,
    fetcher,
    { parallel: true },
  );

  const comments = data?.flatMap((d) => d.comments) ?? [];
  const pageCount = data?.[0].pageCount ?? 0;

  const isLoadingMore =
    isLoading || (size > 0 && data && typeof data[size - 1] === 'undefined');

  const isAtEnd = !(size < data?.[0].pageCount!);

  return {
    comments,
    isLoading,
    error: error as undefined,
    mutate,
    size,
    setSize,
    isLoadingMore,
    isAtEnd,
    pageCount,
  };
};

export default useBeerPostComments;
