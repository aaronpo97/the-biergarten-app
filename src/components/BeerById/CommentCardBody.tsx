import UserContext from '@/contexts/userContext';
import useBeerPostComments from '@/hooks/useBeerPostComments';
import useTimeDistance from '@/hooks/useTimeDistance';
import BeerCommentQueryResult from '@/services/BeerComment/schema/BeerCommentQueryResult';
import BeerCommentValidationSchema from '@/services/BeerComment/schema/CreateBeerCommentValidationSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import format from 'date-fns/format';
import Link from 'next/link';
import { Dispatch, FC, SetStateAction, useContext, useEffect, useState } from 'react';
import { Rating } from 'react-daisyui';
import { SubmitHandler, useForm } from 'react-hook-form';

import { FaEllipsisH } from 'react-icons/fa';
import { useInView } from 'react-intersection-observer';
import { z } from 'zod';
import FormError from '../ui/forms/FormError';
import FormInfo from '../ui/forms/FormInfo';
import FormLabel from '../ui/forms/FormLabel';
import FormSegment from '../ui/forms/FormSegment';
import FormTextArea from '../ui/forms/FormTextArea';

interface CommentCardProps {
  comment: z.infer<typeof BeerCommentQueryResult>;
  mutate: ReturnType<typeof useBeerPostComments>['mutate'];
  ref?: ReturnType<typeof useInView>['ref'];
}

interface CommentCardDropdownProps extends CommentCardProps {
  inEditMode: boolean;
  setInEditMode: Dispatch<SetStateAction<boolean>>;
}

const CommentCardDropdown: FC<CommentCardDropdownProps> = ({
  comment,
  setInEditMode,
}) => {
  const { user } = useContext(UserContext);

  const isCommentOwner = user?.id === comment.postedBy.id;

  return (
    <div className="dropdown-end dropdown">
      <label tabIndex={0} className="btn-ghost btn-sm btn m-1">
        <FaEllipsisH />
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu rounded-box w-52 bg-base-100 p-2 shadow"
      >
        <li>
          {isCommentOwner ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setInEditMode(true);
                }}
              >
                Edit
              </button>
            </>
          ) : (
            <button>Report</button>
          )}
        </li>
      </ul>
    </div>
  );
};

const EditCommentBody: FC<CommentCardDropdownProps> = ({
  comment,
  setInEditMode,
  ref,
  mutate,
}) => {
  const { register, handleSubmit, formState, setValue, watch } = useForm<
    z.infer<typeof BeerCommentValidationSchema>
  >({
    defaultValues: {
      content: comment.content,
      rating: comment.rating,
    },
    resolver: zodResolver(BeerCommentValidationSchema),
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

  const onSubmit: SubmitHandler<z.infer<typeof BeerCommentValidationSchema>> = async (
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
            <div className="flex">
              <div className="w-4/12">
                <button
                  type="submit"
                  disabled={formState.isSubmitting || isDeleting}
                  className="btn-ghost btn-sm btn w-full"
                >
                  Save
                </button>
              </div>

              <div className="w-4/12">
                <button
                  type="button"
                  className="btn-ghost btn-sm btn w-full"
                  disabled={formState.isSubmitting || isDeleting}
                  onClick={() => {
                    setInEditMode(false);
                  }}
                >
                  Cancel
                </button>
              </div>

              <div className="w-4/12">
                <button
                  type="button"
                  className="btn-ghost btn-sm btn w-full"
                  onClick={handleDelete}
                  disabled={isDeleting || formState.isSubmitting}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

const CommentContentBody: FC<CommentCardDropdownProps> = ({
  comment,
  ref,
  mutate,
  inEditMode,
  setInEditMode,
}) => {
  const { user } = useContext(UserContext);
  const timeDistance = useTimeDistance(new Date(comment.createdAt));

  return (
    <div className="card-body animate-in fade-in-10" ref={ref}>
      <div className="flex flex-row justify-between">
        <div>
          <h3 className="font-semibold sm:text-2xl">
            <Link href={`/users/${comment.postedBy.id}`} className="link-hover link">
              {comment.postedBy.username}
            </Link>
          </h3>
          <h4 className="italic">
            posted{' '}
            <time
              className="tooltip tooltip-bottom"
              data-tip={format(new Date(comment.createdAt), 'MM/dd/yyyy')}
            >
              {timeDistance}
            </time>{' '}
            ago
          </h4>
        </div>

        {user && (
          <CommentCardDropdown
            comment={comment}
            mutate={mutate}
            inEditMode={inEditMode}
            setInEditMode={setInEditMode}
          />
        )}
      </div>

      <div className="space-y-1">
        <Rating value={comment.rating}>
          {Array.from({ length: 5 }).map((val, index) => (
            <Rating.Item
              name="rating-1"
              className="mask mask-star cursor-default"
              disabled
              aria-disabled
              key={index}
            />
          ))}
        </Rating>
        <p>{comment.content}</p>
      </div>
    </div>
  );
};

const CommentCardBody: FC<CommentCardProps> = ({ comment, mutate, ref }) => {
  const [inEditMode, setInEditMode] = useState(false);

  return !inEditMode ? (
    <CommentContentBody
      comment={comment}
      inEditMode={inEditMode}
      mutate={mutate}
      ref={ref}
      setInEditMode={setInEditMode}
    />
  ) : (
    <EditCommentBody
      comment={comment}
      inEditMode={inEditMode}
      mutate={mutate}
      ref={ref}
      setInEditMode={setInEditMode}
    />
  );
};

export default CommentCardBody;
