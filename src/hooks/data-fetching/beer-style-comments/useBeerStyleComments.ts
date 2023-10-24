import CommentQueryResult from '@/services/schema/CommentSchema/CommentQueryResult';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { z } from 'zod';
import useSWRInfinite from 'swr/infinite';

interface UseBeerStyleCommentsProps {
  id: string;
  pageSize: number;
  pageNum: number;
}

const useBeerStyleComments = ({ id, pageSize }: UseBeerStyleCommentsProps) => {
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
