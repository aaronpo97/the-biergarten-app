import useBreweryPostComments from '@/hooks/data-fetching/brewery-comments/useBreweryPostComments';
import BreweryPostQueryResult from '@/services/BreweryPost/schema/BreweryPostQueryResult';
import CreateCommentValidationSchema from '@/services/schema/CommentSchema/CreateCommentValidationSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { FC } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import sendCreateBreweryCommentRequest from '@/requests/BreweryComment/sendCreateBreweryCommentRequest';
import createErrorToast from '@/util/createErrorToast';
import CommentForm from '../ui/CommentForm';

interface BreweryCommentFormProps {
  breweryPost: z.infer<typeof BreweryPostQueryResult>;
  mutate: ReturnType<typeof useBreweryPostComments>['mutate'];
}

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
    const loadingToast = toast.loading('Posting a new comment...');
    try {
      await sendCreateBreweryCommentRequest({
        content: data.content,
        rating: data.rating,
        breweryPostId: breweryPost.id,
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

export default BreweryCommentForm;
