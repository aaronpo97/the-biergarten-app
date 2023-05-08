import sendEditBeerPostRequest from '@/requests/sendEditBeerPostRequest';
import EditBeerPostValidationSchema from '@/services/BeerPost/schema/EditBeerPostValidationSchema';
import { zodResolver } from '@hookform/resolvers/zod';

import { useRouter } from 'next/router';
import { FC, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import ErrorAlert from './ui/alerts/ErrorAlert';
import Button from './ui/forms/Button';
import FormError from './ui/forms/FormError';
import FormInfo from './ui/forms/FormInfo';
import FormLabel from './ui/forms/FormLabel';
import FormSegment from './ui/forms/FormSegment';
import FormTextArea from './ui/forms/FormTextArea';
import FormTextInput from './ui/forms/FormTextInput';

type EditBeerPostSchema = z.infer<typeof EditBeerPostValidationSchema>;

interface EditBeerPostFormProps {
  previousValues: EditBeerPostSchema;
}

const EditBeerPostForm: FC<EditBeerPostFormProps> = ({ previousValues }) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditBeerPostSchema>({
    resolver: zodResolver(EditBeerPostValidationSchema),
    defaultValues: previousValues,
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit: SubmitHandler<EditBeerPostSchema> = async (data) => {
    try {
      setIsSubmitting(true);
      await sendEditBeerPostRequest(data);
      router.push(`/beers/${data.id}`);
    } catch (e) {
      setIsSubmitting(false);
      if (!(e instanceof Error)) {
        setError('Something went wrong');
        return;
      }
      setError(e.message);
    }
  };

  const onDelete = async () => {
    try {
      const response = await fetch(`/api/beers/${previousValues.id}`, {
        method: 'DELETE',
      });
      if (response.status === 200) {
        router.push('/beers');
      }
    } catch (e) {
      if (!(e instanceof Error)) {
        setError('Something went wrong');
        return;
      }
      setError(e.message);
    }
  };
  return (
    <form className="form-control" onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-5">
        {error && <ErrorAlert error={error} setError={setError} />}
      </div>
      <FormInfo>
        <FormLabel htmlFor="name">Name</FormLabel>
        <FormError>{errors.name?.message}</FormError>
      </FormInfo>
      <FormSegment>
        <FormTextInput
          placeholder="Lorem Ipsum Lager"
          formValidationSchema={register('name')}
          error={!!errors.name}
          type="text"
          id="name"
          disabled={isSubmitting}
        />
      </FormSegment>

      <div className="flex flex-wrap sm:text-xs md:mb-3">
        <div className="mb-2 w-full md:mb-0 md:w-1/2 md:pr-3">
          <FormInfo>
            <FormLabel htmlFor="abv">ABV</FormLabel>
            <FormError>{errors.abv?.message}</FormError>
          </FormInfo>
          <FormTextInput
            disabled={isSubmitting}
            placeholder="12"
            formValidationSchema={register('abv', { valueAsNumber: true })}
            error={!!errors.abv}
            type="text"
            id="abv"
          />
        </div>
        <div className="mb-2 w-full md:mb-0 md:w-1/2 md:pl-3">
          <FormInfo>
            <FormLabel htmlFor="ibu">IBU</FormLabel>
            <FormError>{errors.ibu?.message}</FormError>
          </FormInfo>
          <FormTextInput
            disabled={isSubmitting}
            placeholder="52"
            formValidationSchema={register('ibu', { valueAsNumber: true })}
            error={!!errors.ibu}
            type="text"
            id="lastName"
          />
        </div>
      </div>

      <FormInfo>
        <FormLabel htmlFor="description">Description</FormLabel>
        <FormError>{errors.description?.message}</FormError>
      </FormInfo>
      <FormSegment>
        <FormTextArea
          disabled={isSubmitting}
          placeholder="Ratione cumque quas quia aut impedit ea culpa facere. Ut in sit et quas reiciendis itaque."
          error={!!errors.description}
          formValidationSchema={register('description')}
          id="description"
          rows={8}
        />
      </FormSegment>

      <div className="mt-2 space-y-4">
        <Button type="submit" isSubmitting={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
        <button
          className={`btn-primary btn w-full rounded-xl ${isSubmitting ? 'loading' : ''}`}
          type="button"
          onClick={onDelete}
        >
          Delete
        </button>
      </div>
    </form>
  );
};

export default EditBeerPostForm;
