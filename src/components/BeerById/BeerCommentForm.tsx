import BeerPostQueryResult from '@/services/posts/beer-post/schema/BeerPostQueryResult';
import { zodResolver } from '@hookform/resolvers/zod';

import { FunctionComponent } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';

import useBeerPostComments from '@/hooks/data-fetching/beer-comments/useBeerPostComments';
import CreateCommentValidationSchema from '@/services/schema/CommentSchema/CreateCommentValidationSchema';
import toast from 'react-hot-toast';
import createErrorToast from '@/util/createErrorToast';
import { sendCreateBeerCommentRequest } from '@/requests/comments/beer-comment';
import CommentForm from '../ui/CommentForm';

interface BeerCommentFormProps {
  beerPost: z.infer<typeof BeerPostQueryResult>;
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
    const loadingToast = toast.loading('Posting a new comment...');
    try {
      await sendCreateBeerCommentRequest({ body: data, beerPostId: beerPost.id });
      reset();
      toast.remove(loadingToast);
      toast.success('Comment posted successfully.');
      await mutate();
    } catch (error) {
      await mutate();
      toast.remove(loadingToast);
      createErrorToast(error);
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
