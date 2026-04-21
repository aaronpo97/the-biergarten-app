import EditBreweryPostValidationSchema from '@/services/posts/brewery-post/schema/EditBreweryPostValidationSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { FC, useState } from 'react';
import BreweryPostQueryResult from '@/services/posts/brewery-post/schema/BreweryPostQueryResult';
import {
  sendDeleteBreweryPostRequest,
  sendEditBreweryPostRequest,
} from '@/requests/posts/brewery-post';
import FormError from './ui/forms/FormError';
import FormInfo from './ui/forms/FormInfo';
import FormLabel from './ui/forms/FormLabel';
import FormSegment from './ui/forms/FormSegment';
import FormTextArea from './ui/forms/FormTextArea';
import FormTextInput from './ui/forms/FormTextInput';

interface EditBreweryPostFormProps {
  breweryPost: z.infer<typeof BreweryPostQueryResult>;
}
const EditBreweryPostForm: FC<EditBreweryPostFormProps> = ({ breweryPost }) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof EditBreweryPostValidationSchema>>({
    resolver: zodResolver(EditBreweryPostValidationSchema),
    defaultValues: {
      name: breweryPost.name,
      description: breweryPost.description,
      id: breweryPost.id,
      dateEstablished: breweryPost.dateEstablished,
    },
  });

  const [isDeleting, setIsDeleting] = useState(false);

  const onSubmit = async (data: z.infer<typeof EditBreweryPostValidationSchema>) => {
    await sendEditBreweryPostRequest({ breweryPostId: breweryPost.id, body: data });
    await router.push(`/breweries/${breweryPost.id}`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    await sendDeleteBreweryPostRequest({ breweryPostId: breweryPost.id });
    await router.push('/breweries');
  };

  return (
    <form className="form-control space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="w-full">
        <FormInfo>
          <FormLabel htmlFor="name">Name</FormLabel>
          <FormError>{errors.name?.message}</FormError>
        </FormInfo>
        <FormSegment>
          <FormTextInput
            id="name"
            type="text"
            placeholder="Name"
            formValidationSchema={register('name')}
            error={!!errors.name}
            disabled={isSubmitting || isDeleting}
          />
        </FormSegment>

        <FormInfo>
          <FormLabel htmlFor="description">Description</FormLabel>
          <FormError>{errors.description?.message}</FormError>
        </FormInfo>
        <FormSegment>
          <FormTextArea
            disabled={isSubmitting || isDeleting}
            placeholder="Ratione cumque quas quia aut impedit ea culpa facere. Ut in sit et quas reiciendis itaque."
            error={!!errors.description}
            formValidationSchema={register('description')}
            id="description"
            rows={8}
          />
        </FormSegment>
      </div>

      <div className="w-full space-y-3">
        <button
          disabled={isSubmitting || isDeleting}
          className="btn btn-primary w-full"
          type="submit"
        >
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
        <button
          className="btn btn-primary w-full"
          type="button"
          disabled={isSubmitting || isDeleting}
          onClick={handleDelete}
        >
          Delete Brewery
        </button>
      </div>
    </form>
  );
};

export default EditBreweryPostForm;
