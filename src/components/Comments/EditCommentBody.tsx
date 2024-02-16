import { zodResolver } from '@hookform/resolvers/zod';
import { FC, useState, Dispatch, SetStateAction } from 'react';
import { Rating } from 'react-daisyui';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import useBeerPostComments from '@/hooks/data-fetching/beer-comments/useBeerPostComments';
import CommentQueryResult from '@/services/schema/CommentSchema/CommentQueryResult';
import CreateCommentValidationSchema from '@/services/schema/CommentSchema/CreateCommentValidationSchema';
import useBreweryPostComments from '@/hooks/data-fetching/brewery-comments/useBreweryPostComments';
import toast from 'react-hot-toast';
import createErrorToast from '@/util/createErrorToast';
import FormError from '../ui/forms/FormError';
import FormInfo from '../ui/forms/FormInfo';
import FormLabel from '../ui/forms/FormLabel';
import FormSegment from '../ui/forms/FormSegment';
import FormTextArea from '../ui/forms/FormTextArea';
import { HandleDeleteCommentRequest, HandleEditCommentRequest } from './types';

interface EditCommentBodyProps {
  comment: z.infer<typeof CommentQueryResult>;
  setInEditMode: Dispatch<SetStateAction<boolean>>;

  mutate: ReturnType<
    typeof useBeerPostComments | typeof useBreweryPostComments
  >['mutate'];
  handleDeleteCommentRequest: HandleDeleteCommentRequest;
  handleEditCommentRequest: HandleEditCommentRequest;
}

const EditCommentBody: FC<EditCommentBodyProps> = ({
  comment,
  setInEditMode,
  mutate,
  handleDeleteCommentRequest,
  handleEditCommentRequest,
}) => {
  const { register, handleSubmit, formState, setValue, watch } = useForm<
    z.infer<typeof CreateCommentValidationSchema>
  >({
    defaultValues: { content: comment.content, rating: comment.rating },
    resolver: zodResolver(CreateCommentValidationSchema),
  });

  const { errors, isSubmitting } = formState;

  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = async () => {
    const loadingToast = toast.loading('Deleting comment...');
    setIsDeleting(true);
    try {
      await handleDeleteCommentRequest(comment.id);
      await mutate();
      toast.remove(loadingToast);
      toast.success('Deleted comment.');
    } catch (error) {
      toast.remove(loadingToast);
      createErrorToast(error);
    }
  };

  const onEdit: SubmitHandler<z.infer<typeof CreateCommentValidationSchema>> = async (
    data,
  ) => {
    const loadingToast = toast.loading('Submitting comment edits...');

    try {
      setInEditMode(true);
      await handleEditCommentRequest(comment.id, data);
      await mutate();
      toast.remove(loadingToast);
      toast.success('Comment edits submitted successfully.');
      setInEditMode(false);
    } catch (error) {
      toast.remove(loadingToast);
      createErrorToast(error);
      setInEditMode(false);
    }
  };

  const disableForm = isSubmitting || isDeleting;

  return (
    <div className="py-4 pr-3 animate-in fade-in-10">
      <form onSubmit={handleSubmit(onEdit)} className="space-y-3">
        <div>
          <FormInfo>
            <FormLabel htmlFor="content">Edit your comment</FormLabel>
            <FormError>{errors.content?.message}</FormError>
          </FormInfo>
          <FormSegment>
            <FormTextArea
              id="content"
              formValidationSchema={register('content')}
              placeholder="Comment"
              rows={2}
              error={!!errors.content?.message}
              disabled={disableForm}
            />
          </FormSegment>
          <div className="flex flex-row items-center justify-between">
            <div>
              <FormInfo>
                <FormLabel htmlFor="rating">Change your rating</FormLabel>
                <FormError>{errors.rating?.message}</FormError>
              </FormInfo>
              <Rating
                value={watch('rating')}
                onChange={(value) => {
                  setValue('rating', value);
                }}
              >
                {Array.from({ length: 5 }).map((val, index) => (
                  <Rating.Item
                    name="rating-1"
                    className="mask mask-star cursor-default"
                    disabled={disableForm}
                    aria-disabled={disableForm}
                    key={index}
                  />
                ))}
              </Rating>
            </div>
            <div className="join">
              <button
                type="button"
                className="btn join-item btn-xs lg:btn-sm"
                disabled={disableForm}
                onClick={() => {
                  setInEditMode(false);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={disableForm}
                className="btn join-item btn-xs lg:btn-sm"
              >
                Save
              </button>
              <button
                type="button"
                className="btn join-item btn-xs lg:btn-sm"
                onClick={onDelete}
                disabled={disableForm}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditCommentBody;
