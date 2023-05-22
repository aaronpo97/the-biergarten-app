import UserContext from '@/contexts/UserContext';
import BreweryPostQueryResult from '@/services/BreweryPost/types/BreweryPostQueryResult';
import { FC, MutableRefObject, useContext, useRef } from 'react';
import { z } from 'zod';
import CreateCommentValidationSchema from '@/services/types/CommentSchema/CreateCommentValidationSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import CommentQueryResult from '@/services/types/CommentSchema/CommentQueryResult';

import useBreweryPostComments from '@/hooks/data-fetching/brewery-comments/useBreweryPostComments';
import toast from 'react-hot-toast';
import LoadingComponent from '../BeerById/LoadingComponent';
import CommentsComponent from '../ui/CommentsComponent';
import CommentForm from '../ui/CommentForm';

interface BreweryBeerSectionProps {
  breweryPost: z.infer<typeof BreweryPostQueryResult>;
}

interface BreweryCommentFormProps {
  breweryPost: z.infer<typeof BreweryPostQueryResult>;
  mutate: ReturnType<typeof useBreweryPostComments>['mutate'];
}

const BreweryCommentValidationSchemaWithId = CreateCommentValidationSchema.extend({
  breweryPostId: z.string(),
});

const sendCreateBreweryCommentRequest = async ({
  content,
  rating,
  breweryPostId,
}: z.infer<typeof BreweryCommentValidationSchemaWithId>) => {
  const response = await fetch(`/api/breweries/${breweryPostId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, rating }),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const data = await response.json();
  const parsedResponse = APIResponseValidationSchema.safeParse(data);
  if (!parsedResponse.success) {
    throw new Error('Invalid API response');
  }

  const parsedPayload = CommentQueryResult.safeParse(parsedResponse.data.payload);
  if (!parsedPayload.success) {
    throw new Error('Invalid API response payload');
  }

  return parsedPayload.data;
};

const BreweryCommentForm: FC<BreweryCommentFormProps> = ({ breweryPost, mutate }) => {
  const { register, handleSubmit, formState, watch, reset, setValue } = useForm<
    z.infer<typeof CreateCommentValidationSchema>
  >({
    defaultValues: { rating: 0 },
    resolver: zodResolver(CreateCommentValidationSchema),
  });

  const onSubmit: SubmitHandler<z.infer<typeof CreateCommentValidationSchema>> = async (
    data,
  ) => {
    await sendCreateBreweryCommentRequest({
      content: data.content,
      rating: data.rating,
      breweryPostId: breweryPost.id,
    });
    await mutate();
    toast.loading('Created new comment.');
    reset();
  };

  return (
    <CommentForm
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      watch={watch}
      setValue={setValue}
      formState={formState}
      register={register}
    />
  );
};

const BreweryCommentsSection: FC<BreweryBeerSectionProps> = ({ breweryPost }) => {
  const { user } = useContext(UserContext);

  const PAGE_SIZE = 4;

  const {
    isLoading,
    setSize,
    size,
    isLoadingMore,
    isAtEnd,
    mutate,
    comments: breweryComments,
  } = useBreweryPostComments({ id: breweryPost.id, pageSize: PAGE_SIZE });

  const commentSectionRef: MutableRefObject<HTMLDivElement | null> = useRef(null);

  const handleDeleteRequest = async (commentId: string) => {
    const response = await fetch(`/api/brewery-comments/${commentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }
  };

  const handleEditRequest = async (
    commentId: string,
    data: z.infer<typeof CreateCommentValidationSchema>,
  ) => {
    const response = await fetch(`/api/brewery-comments/${commentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: data.content, rating: data.rating }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }
  };

  return (
    <div className="w-full space-y-3" ref={commentSectionRef}>
      <div className="card">
        <div className="card-body h-full">
          {user ? (
            <BreweryCommentForm breweryPost={breweryPost} mutate={mutate} />
          ) : (
            <div className="flex h-52 flex-col items-center justify-center">
              <div className="text-lg font-bold">Log in to leave a comment.</div>
            </div>
          )}
        </div>
      </div>
      {
        /**
         * If the comments are loading, show a loading component. Otherwise, show the
         * comments.
         */
        isLoading ? (
          <div className="card pb-6">
            <LoadingComponent length={PAGE_SIZE} />
          </div>
        ) : (
          <CommentsComponent
            comments={breweryComments}
            isLoadingMore={isLoadingMore}
            isAtEnd={isAtEnd}
            pageSize={PAGE_SIZE}
            setSize={setSize}
            size={size}
            commentSectionRef={commentSectionRef}
            mutate={mutate}
            handleDeleteRequest={handleDeleteRequest}
            handleEditRequest={handleEditRequest}
          />
        )
      }
    </div>
  );
};

export default BreweryCommentsSection;
