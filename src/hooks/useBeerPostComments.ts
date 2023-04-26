import BeerCommentQueryResult from '@/services/BeerComment/schema/BeerCommentQueryResult';
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
 * @returns An object containing the fetched comments, the total number of comment pages,
 *   a boolean indicating if the request is currently loading, and a function to mutate
 *   the data.
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
    const parsedPayload = z.array(BeerCommentQueryResult).safeParse(parsed.data.payload);

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

  console.log(comments);

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
