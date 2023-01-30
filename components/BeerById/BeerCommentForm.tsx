import BeerPostQueryResult from '@/services/BeerPost/types/BeerPostQueryResult';
import { Dispatch, FunctionComponent, SetStateAction } from 'react';
import { z } from 'zod';
import FormLabel from '@/components/ui/forms/FormLabel';
import FormError from '@/components/ui/forms/FormError';
import FormTextArea from '@/components/ui/forms/FormTextArea';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '@/components/ui/forms/Button';
import FormInfo from '@/components/ui/forms/FormInfo';
// @ts-expect-error
import ReactStars from 'react-rating-stars-component';
import FormSegment from '@/components/ui/forms/FormSegment';
import BeerCommentQueryResult from '@/services/BeerPost/types/BeerCommentQueryResult';
import BeerCommentValidationSchema from '@/validation/CreateBeerCommentValidationSchema';
import sendCreateBeerCommentRequest from '@/requests/sendCreateBeerCommentRequest';

interface BeerCommentFormProps {
  beerPost: BeerPostQueryResult;
  setComments: Dispatch<SetStateAction<BeerCommentQueryResult[]>>;
}

const BeerCommentForm: FunctionComponent<BeerCommentFormProps> = ({
  beerPost,
  setComments,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<z.infer<typeof BeerCommentValidationSchema>>({
    defaultValues: {
      beerPostId: beerPost.id,
      rating: 0,
    },
    resolver: zodResolver(BeerCommentValidationSchema),
  });

  const onSubmit: SubmitHandler<z.infer<typeof BeerCommentValidationSchema>> = async (
    data,
  ) => {
    setValue('rating', 0);
    await sendCreateBeerCommentRequest(data);
    setComments((prev) => prev);
    reset();
  };

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
      <ReactStars
        id="rating"
        count={5}
        size={34}
        activeColor="#ffd700"
        edit={true}
        value={0}
        onChange={(value: 1 | 2 | 3 | 4 | 5) => setValue('rating', value)}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
};

export default BeerCommentForm;
