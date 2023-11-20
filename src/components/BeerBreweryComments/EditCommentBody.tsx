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

interface EditCommentBodyProps {
  comment: z.infer<typeof CommentQueryResult>;
  setInEditMode: Dispatch<SetStateAction<boolean>>;

  mutate: ReturnType<
    typeof useBeerPostComments | typeof useBreweryPostComments
  >['mutate'];
  handleDeleteRequest: (id: string) => Promise<void>;
  handleEditRequest: (
    id: string,
    data: z.infer<typeof CreateCommentValidationSchema>,
  ) => Promise<void>;
}

const EditCommentBody: FC<EditCommentBodyProps> = ({
  comment,
  setInEditMode,
  mutate,
  handleDeleteRequest,
  handleEditRequest,
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
      await handleDeleteRequest(comment.id);
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
      await handleEditRequest(comment.id, data);
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

  return (
    <div className="pr-3 py-4 animate-in fade-in-10">
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
              disabled={isSubmitting || isDeleting}
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
                    disabled={isSubmitting || isDeleting}
                    aria-disabled={isSubmitting || isDeleting}
                    key={index}
                  />
                ))}
              </Rating>
            </div>
            <div className="join">
              <button
                type="button"
                className="btn-xs join-item btn lg:btn-sm"
                disabled={isSubmitting || isDeleting}
                onClick={() => {
                  setInEditMode(false);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isDeleting}
                className="btn-xs join-item btn lg:btn-sm"
              >
                Save
              </button>
              <button
                type="button"
                className="btn-xs join-item btn lg:btn-sm"
                onClick={onDelete}
                disabled={isDeleting || formState.isSubmitting}
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
