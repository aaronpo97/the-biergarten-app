import BeerCommentQueryResult from '@/services/BeerComment/schema/BeerCommentQueryResult';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { z } from 'zod';
import useSWR from 'swr';

interface UseBeerPostCommentsProps {
  pageNum: number;
  id: string;
  pageSize: number;
}

const useBeerPostComments = ({ pageNum, id, pageSize }: UseBeerPostCommentsProps) => {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/beers/${id}/comments?page_num=${pageNum}&page_size=${pageSize}`,
    async (url) => {
      const response = await fetch(url);
      const json = await response.json();
      const count = response.headers.get('X-Total-Count');
      const parsed = APIResponseValidationSchema.safeParse(json);

      if (!parsed.success) {
        throw new Error(parsed.error.message);
      }
      const parsedPayload = z
        .array(BeerCommentQueryResult)
        .safeParse(parsed.data.payload);

      if (!parsedPayload.success) {
        throw new Error(parsedPayload.error.message);
      }

      const pageCount = Math.ceil(parseInt(count as string, 10) / 10);
      return { comments: parsedPayload.data, pageCount };
    },
  );
  return {
    comments: data?.comments,
    commentsPageCount: data?.pageCount,
    isLoading,
    error: error as undefined,
    mutate,
  };
};

export default useBeerPostComments;
