import { zodResolver } from '@hookform/resolvers/zod';

import { FunctionComponent } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';

import CreateCommentValidationSchema from '@/services/schema/CommentSchema/CreateCommentValidationSchema';
import toast from 'react-hot-toast';
import createErrorToast from '@/util/createErrorToast';

import BeerStyleQueryResult from '@/services/posts/beer-style-post/schema/BeerStyleQueryResult';
import useBeerStyleComments from '@/hooks/data-fetching/beer-style-comments/useBeerStyleComments';
import { sendCreateBeerStyleCommentRequest } from '@/requests/comments/beer-style-comment';
import CommentForm from '../ui/CommentForm';

interface BeerCommentFormProps {
  beerStyle: z.infer<typeof BeerStyleQueryResult>;
  mutate: ReturnType<typeof useBeerStyleComments>['mutate'];
}

const BeerStyleCommentForm: FunctionComponent<BeerCommentFormProps> = ({
  beerStyle,
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
      await sendCreateBeerStyleCommentRequest({
        body: { content: data.content, rating: data.rating },
        beerStyleId: beerStyle.id,
      });
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

export default BeerStyleCommentForm;
