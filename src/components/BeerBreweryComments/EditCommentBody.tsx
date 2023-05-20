import { zodResolver } from '@hookform/resolvers/zod';
import { FC, useState, Dispatch, SetStateAction, useContext } from 'react';
import { Rating } from 'react-daisyui';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import useBeerPostComments from '@/hooks/data-fetching/beer-comments/useBeerPostComments';
import CommentQueryResult from '@/services/types/CommentSchema/CommentQueryResult';
import CreateCommentValidationSchema from '@/services/types/CommentSchema/CreateCommentValidationSchema';
import useBreweryPostComments from '@/hooks/data-fetching/brewery-comments/useBreweryPostComments';
import ToastContext from '@/contexts/ToastContext';
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

  const { toast } = useContext(ToastContext);
  const { errors } = formState;

  const [isDeleting, setIsDeleting] = useState(false);

  const onDelete = async () => {
    setIsDeleting(true);
    await handleDeleteRequest(comment.id);
    await mutate();
  };

  const onEdit: SubmitHandler<z.infer<typeof CreateCommentValidationSchema>> = async (
    data,
  ) => {
    setInEditMode(true);
    await handleEditRequest(comment.id, data);
    await mutate();
    toast.success('Submitted edits');
    setInEditMode(false);
  };

  return (
    <div className="card-body animate-in fade-in-10">
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
              disabled={formState.isSubmitting || isDeleting}
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
                    disabled={formState.isSubmitting || isDeleting}
                    aria-disabled={formState.isSubmitting || isDeleting}
                    key={index}
                  />
                ))}
              </Rating>
            </div>
            <div className="btn-group btn-group-horizontal">
              <button
                type="button"
                className="btn-xs btn lg:btn-sm"
                disabled={formState.isSubmitting || isDeleting}
                onClick={() => {
                  setInEditMode(false);
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formState.isSubmitting || isDeleting}
                className="btn-xs btn lg:btn-sm"
              >
                Save
              </button>
              <button
                type="button"
                className="btn-xs btn lg:btn-sm"
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
