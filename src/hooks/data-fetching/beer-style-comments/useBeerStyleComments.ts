import CommentQueryResult from '@/services/schema/CommentSchema/CommentQueryResult';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { z } from 'zod';
import useSWRInfinite from 'swr/infinite';

interface UseBeerStyleCommentsOptions {
  id: string;
  pageSize: number;
  pageNum: number;
}
/**
 * A custom hook to fetch comments for a beer style post.
 *
 * @param options The options for fetching comments.
 * @param options.id The ID of the beer style to fetch comments for.
 * @param options.pageSize The number of comments to fetch per page.
 * @param options.pageNum The page number to fetch.
 * @returns An object with the following properties:
 *
 *   - `comments`: The comments fetched from the API.
 *   - `error`: The error that occurred while fetching the data.
 *   - `isLoading`: A boolean indicating whether the data is being fetched.
 *   - `isLoadingMore`: A boolean indicating whether more data is being fetched.
 *   - `isAtEnd`: A boolean indicating whether all data has been fetched.
 *   - `mutate`: A function to mutate the data.
 *   - `pageCount`: The total number of pages of data.
 *   - `setSize`: A function to set the size of the data.
 *   - `size`: The size of the data.
 */
const useBeerStyleComments = ({ id, pageSize }: UseBeerStyleCommentsOptions) => {
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
    (index) =>
      `/api/beers/styles/${id}/comments?page_num=${index + 1}&page_size=${pageSize}`,
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

export default useBeerStyleComments;
