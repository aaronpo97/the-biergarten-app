import { zodResolver } from '@hookform/resolvers/zod';
import { FC, useState, useEffect, Dispatch, SetStateAction } from 'react';
import { Rating } from 'react-daisyui';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import useBeerPostComments from '@/hooks/data-fetching/beer-comments/useBeerPostComments';
import CommentQueryResult from '@/services/types/CommentSchema/CommentQueryResult';
import { useInView } from 'react-intersection-observer';
import CreateCommentValidationSchema from '@/services/types/CommentSchema/CreateCommentValidationSchema';
import FormError from '../ui/forms/FormError';
import FormInfo from '../ui/forms/FormInfo';
import FormLabel from '../ui/forms/FormLabel';
import FormSegment from '../ui/forms/FormSegment';
import FormTextArea from '../ui/forms/FormTextArea';

interface CommentCardDropdownProps {
  comment: z.infer<typeof CommentQueryResult>;
  setInEditMode: Dispatch<SetStateAction<boolean>>;
  ref: ReturnType<typeof useInView>['ref'] | undefined;
  mutate: ReturnType<typeof useBeerPostComments>['mutate'];
}

const EditCommentBody: FC<CommentCardDropdownProps> = ({
  comment,
  setInEditMode,
  ref,
  mutate,
}) => {
  const { register, handleSubmit, formState, setValue, watch } = useForm<
    z.infer<typeof CreateCommentValidationSchema>
  >({
    defaultValues: {
      content: comment.content,
      rating: comment.rating,
    },
    resolver: zodResolver(CreateCommentValidationSchema),
  });

  const { errors } = formState;

  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    return () => {
      setIsDeleting(false);
    };
  }, []);

  const handleDelete = async () => {
    setIsDeleting(true);
    const response = await fetch(`/api/beer-comments/${comment.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete comment');
    }

    await mutate();
  };

  const onSubmit: SubmitHandler<z.infer<typeof CreateCommentValidationSchema>> = async (
    data,
  ) => {
    const response = await fetch(`/api/beer-comments/${comment.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: data.content,
        rating: data.rating,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to update comment');
    }

    await mutate();
    setInEditMode(false);
  };
  return (
    <div className="card-body animate-in fade-in-10" ref={ref}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
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
                onClick={handleDelete}
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
