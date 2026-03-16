import { FunctionComponent } from 'react';
import router from 'next/router';
import { zodResolver } from '@hookform/resolvers/zod';
import { BeerStyle } from '@prisma/client';
import toast from 'react-hot-toast';
import { useForm, SubmitHandler, FieldError } from 'react-hook-form';
import { z } from 'zod';

import BreweryPostQueryResult from '@/services/posts/brewery-post/schema/BreweryPostQueryResult';
import CreateBeerPostValidationSchema from '@/services/posts/beer-post/schema/CreateBeerPostValidationSchema';
import UploadImageValidationSchema from '@/services/schema/ImageSchema/UploadImageValidationSchema';

import createErrorToast from '@/util/createErrorToast';

import { sendCreateBeerPostRequest } from '@/requests/posts/beer-post';
import sendUploadBeerImagesRequest from '@/requests/images/beer-image/sendUploadBeerImageRequest';

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
  styles: BeerStyle[];
}

const CreateBeerPostWithImagesValidationSchema = CreateBeerPostValidationSchema.merge(
  UploadImageValidationSchema,
);

const CreateBeerPostForm: FunctionComponent<BeerFormProps> = ({
  styles = [],
  brewery,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof CreateBeerPostWithImagesValidationSchema>>({
    resolver: zodResolver(CreateBeerPostWithImagesValidationSchema),
    defaultValues: { breweryId: brewery.id },
  });

  const onSubmit: SubmitHandler<
    z.infer<typeof CreateBeerPostWithImagesValidationSchema>
  > = async (data) => {
    if (!(data.images instanceof FileList)) {
      return;
    }

    try {
      const loadingToast = toast.loading('Creating beer post...');
      const beerPost = await sendCreateBeerPostRequest({
        body: {
          name: data.name,
          description: data.description,
          abv: data.abv,
          ibu: data.ibu,
        },
        breweryId: data.breweryId,
        styleId: data.styleId,
      });
      await sendUploadBeerImagesRequest({ beerPost, images: data.images });
      await router.push(`/beers/${beerPost.id}`);
      toast.dismiss(loadingToast);
      toast.success('Created beer post.');
    } catch (e) {
      createErrorToast(e);
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
        <FormLabel htmlFor="typeId">Style</FormLabel>
        <FormError>{errors.styleId?.message}</FormError>
      </FormInfo>
      <FormSegment>
        <FormSelect
          disabled={isSubmitting}
          formRegister={register('styleId')}
          error={!!errors.styleId}
          id="styleId"
          options={styles.map((style) => ({
            value: style.id,
            text: style.name,
          }))}
          placeholder="Beer style"
          message="Pick a beer style"
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
          className="file-input file-input-bordered w-full"
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
