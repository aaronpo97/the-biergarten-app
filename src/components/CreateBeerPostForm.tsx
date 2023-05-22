import { zodResolver } from '@hookform/resolvers/zod';
import { BeerType } from '@prisma/client';
import router from 'next/router';
import { FunctionComponent } from 'react';
import { useForm, SubmitHandler, FieldError } from 'react-hook-form';
import { z } from 'zod';
import BreweryPostQueryResult from '@/services/BreweryPost/types/BreweryPostQueryResult';
import CreateBeerPostValidationSchema from '@/services/BeerPost/schema/CreateBeerPostValidationSchema';
import sendCreateBeerPostRequest from '@/requests/BeerPost/sendCreateBeerPostRequest';
import UploadImageValidationSchema from '@/services/types/ImageSchema/UploadImageValidationSchema';
import sendUploadBeerImagesRequest from '@/requests/BeerImage/sendUploadBeerImageRequest';

import toast from 'react-hot-toast';

import Button from './ui/forms/Button';
import FormError from './ui/forms/FormError';
import FormInfo from './ui/forms/FormInfo';
import FormLabel from './ui/forms/FormLabel';
import FormSegment from './ui/forms/FormSegment';
import FormSelect from './ui/forms/FormSelect';
import FormTextArea from './ui/forms/FormTextArea';
import FormTextInput from './ui/forms/FormTextInput';

interface BeerFormProps {
  brewery: z.infer<typeof BreweryPostQueryResult>;
  types: BeerType[];
}

const CreateBeerPostWithImagesValidationSchema = CreateBeerPostValidationSchema.merge(
  UploadImageValidationSchema,
);

const CreateBeerPostForm: FunctionComponent<BeerFormProps> = ({
  types = [],
  brewery,
}) => {
  const { register, handleSubmit, formState } = useForm<
    z.infer<typeof CreateBeerPostWithImagesValidationSchema>
  >({
    resolver: zodResolver(CreateBeerPostWithImagesValidationSchema),
    defaultValues: { breweryId: brewery.id },
  });

  const { errors, isSubmitting } = formState;

  const onSubmit: SubmitHandler<
    z.infer<typeof CreateBeerPostWithImagesValidationSchema>
  > = async (data) => {
    if (!(data.images instanceof FileList)) {
      return;
    }

    try {
      const response = await sendCreateBeerPostRequest(data);
      await sendUploadBeerImagesRequest({ beerPost: response, images: data.images });
      await router.push(`/beers/${response.id}`);
      toast.success('Created beer post.');
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Something went wrong.';

      toast.error(errorMessage);
    }
  };

  return (
    <form className="form-control" onSubmit={handleSubmit(onSubmit)}>
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

      <FormInfo>
        <FormLabel htmlFor="typeId">Type</FormLabel>
        <FormError>{errors.typeId?.message}</FormError>
      </FormInfo>
      <FormSegment>
        <FormSelect
          disabled={isSubmitting}
          formRegister={register('typeId')}
          error={!!errors.typeId}
          id="typeId"
          options={types.map((beerType) => ({
            value: beerType.id,
            text: beerType.name,
          }))}
          placeholder="Beer type"
          message="Pick a beer type"
        />
      </FormSegment>

      <div className="flex flex-wrap md:mb-3">
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

      <FormInfo>
        <FormLabel htmlFor="images">Images</FormLabel>
        <FormError>{(errors.images as FieldError | undefined)?.message}</FormError>
      </FormInfo>
      <FormSegment>
        <input
          type="file"
          {...register('images')}
          multiple
          className="file-input-bordered file-input w-full"
          disabled={isSubmitting}
        />
      </FormSegment>

      <div className="mt-6">
        <Button type="submit" isSubmitting={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </form>
  );
};

export default CreateBeerPostForm;
