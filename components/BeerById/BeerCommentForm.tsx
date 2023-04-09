import sendCreateBeerCommentRequest from '@/requests/sendCreateBeerCommentRequest';
import BeerCommentValidationSchema from '@/services/BeerComment/schema/CreateBeerCommentValidationSchema';
import beerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';
import { zodResolver } from '@hookform/resolvers/zod';

import { FunctionComponent, useState, useEffect } from 'react';
import { Rating } from 'react-daisyui';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';

import useBeerPostComments from '@/hooks/useBeerPostComments';
import Button from '../ui/forms/Button';
import FormError from '../ui/forms/FormError';
import FormInfo from '../ui/forms/FormInfo';
import FormLabel from '../ui/forms/FormLabel';
import FormSegment from '../ui/forms/FormSegment';
import FormTextArea from '../ui/forms/FormTextArea';

interface BeerCommentFormProps {
  beerPost: z.infer<typeof beerPostQueryResult>;
  mutate: ReturnType<typeof useBeerPostComments>['mutate'];
}

const BeerCommentForm: FunctionComponent<BeerCommentFormProps> = ({
  beerPost,
  mutate,
}) => {
  const { register, handleSubmit, formState, reset, setValue } = useForm<
    z.infer<typeof BeerCommentValidationSchema>
  >({
    defaultValues: {
      rating: 0,
    },
    resolver: zodResolver(BeerCommentValidationSchema),
  });

  const [rating, setRating] = useState(0);
  useEffect(() => {
    setRating(0);
    reset({ rating: 0, content: '' });
  }, [reset]);

  const onSubmit: SubmitHandler<z.infer<typeof BeerCommentValidationSchema>> = async (
    data,
  ) => {
    setValue('rating', 0);
    setRating(0);
    await sendCreateBeerCommentRequest({
      content: data.content,
      rating: data.rating,
      beerPostId: beerPost.id,
    });
    await mutate();
    reset();
  };

  const { errors } = formState;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <FormInfo>
          <FormLabel htmlFor="content">Leave a comment</FormLabel>
          <FormError>{errors.content?.message}</FormError>
        </FormInfo>
        <FormSegment>
          <FormTextArea
            id="content"
            formValidationSchema={register('content')}
            placeholder="Comment"
            rows={5}
            error={!!errors.content?.message}
            disabled={formState.isSubmitting}
          />
        </FormSegment>
        <FormInfo>
          <FormLabel htmlFor="rating">Rating</FormLabel>
          <FormError>{errors.rating?.message}</FormError>
        </FormInfo>
        <Rating
          value={rating}
          onChange={(value) => {
            setRating(value);
            setValue('rating', value);
          }}
        >
          <Rating.Item name="rating-1" className="mask mask-star" />
          <Rating.Item name="rating-1" className="mask mask-star" />
          <Rating.Item name="rating-1" className="mask mask-star" />
          <Rating.Item name="rating-1" className="mask mask-star" />
          <Rating.Item name="rating-1" className="mask mask-star" />
        </Rating>
      </div>

      <div>
        <Button type="submit" isSubmitting={formState.isSubmitting}>
          Submit
        </Button>
      </div>
    </form>
  );
};

export default BeerCommentForm;
