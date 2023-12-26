import { FC } from 'react';
import { Rating } from 'react-daisyui';
import type {
  FormState,
  SubmitHandler,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import FormError from '../ui/forms/FormError';
import FormInfo from '../ui/forms/FormInfo';
import FormLabel from '../ui/forms/FormLabel';
import FormSegment from '../ui/forms/FormSegment';
import FormTextArea from '../ui/forms/FormTextArea';
import Button from '../ui/forms/Button';

interface Comment {
  content: string;
  rating: number;
}

interface CommentFormProps {
  handleSubmit: UseFormHandleSubmit<Comment>;
  onSubmit: SubmitHandler<Comment>;
  watch: UseFormWatch<Comment>;
  setValue: UseFormSetValue<Comment>;
  formState: FormState<Comment>;
  register: UseFormRegister<Comment>;
}

const CommentForm: FC<CommentFormProps> = ({
  handleSubmit,
  onSubmit,
  watch,
  setValue,
  formState,
  register,
}) => {
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
          value={watch('rating')}
          onChange={(value) => {
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

export default CommentForm;
