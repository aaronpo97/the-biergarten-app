import sendCreateBeerCommentRequest from '@/requests/BeerComment/sendCreateBeerCommentRequest';

import beerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';
import { zodResolver } from '@hookform/resolvers/zod';

import { FunctionComponent } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';

import useBeerPostComments from '@/hooks/data-fetching/beer-comments/useBeerPostComments';
import CreateCommentValidationSchema from '@/services/types/CommentSchema/CreateCommentValidationSchema';
import toast from 'react-hot-toast';
import CommentForm from '../ui/CommentForm';

interface BeerCommentFormProps {
  beerPost: z.infer<typeof beerPostQueryResult>;
  mutate: ReturnType<typeof useBeerPostComments>['mutate'];
}

const BeerCommentForm: FunctionComponent<BeerCommentFormProps> = ({
  beerPost,
  mutate,
}) => {
  const { register, handleSubmit, formState, watch, reset, setValue } = useForm<
    z.infer<typeof CreateCommentValidationSchema>
  >({
    defaultValues: { rating: 0 },
    resolver: zodResolver(CreateCommentValidationSchema),
  });

  const onSubmit: SubmitHandler<z.infer<typeof CreateCommentValidationSchema>> = async (
    data,
  ) => {
    try {
      await sendCreateBeerCommentRequest({
        content: data.content,
        rating: data.rating,
        beerPostId: beerPost.id,
      });
      await mutate();
      reset();
      toast.success('Created a new comment!');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Something went wrong.';
      toast.error(errorMessage);

      reset();
    }
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

export default BeerCommentForm;
