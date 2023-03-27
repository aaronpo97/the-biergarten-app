import sendCreateBeerCommentRequest from '@/requests/sendCreateBeerCommentRequest';
import BeerCommentValidationSchema from '@/services/BeerComment/schema/CreateBeerCommentValidationSchema';
import { BeerPostQueryResult } from '@/services/BeerPost/schema/BeerPostQueryResult';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { FunctionComponent, useState, useEffect } from 'react';
import { Rating } from 'react-daisyui';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';

import Button from '../ui/forms/Button';
import FormError from '../ui/forms/FormError';
import FormInfo from '../ui/forms/FormInfo';
import FormLabel from '../ui/forms/FormLabel';
import FormSegment from '../ui/forms/FormSegment';
import FormTextArea from '../ui/forms/FormTextArea';

interface BeerCommentFormProps {
  beerPost: BeerPostQueryResult;
}

const BeerCommentForm: FunctionComponent<BeerCommentFormProps> = ({ beerPost }) => {
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

  const router = useRouter();
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
    reset();
    router.replace(`/beers/${beerPost.id}?comments_page=1`, undefined, { scroll: false });
  };

  const { errors } = formState;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
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
      <Button type="submit">Submit</Button>
    </form>
  );
};

export default BeerCommentForm;
