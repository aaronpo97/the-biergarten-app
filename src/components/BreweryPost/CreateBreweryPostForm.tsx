import sendUploadBreweryImagesRequest from '@/requests/BreweryImage/sendUploadBreweryImageRequest';
import sendCreateBreweryPostRequest from '@/requests/BreweryPost/sendCreateBreweryPostRequest';
import CreateBreweryPostSchema from '@/services/BreweryPost/schema/CreateBreweryPostSchema';
import UploadImageValidationSchema from '@/services/schema/ImageSchema/UploadImageValidationSchema';
import createErrorToast from '@/util/createErrorToast';
import { Tab } from '@headlessui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { AddressAutofillRetrieveResponse } from '@mapbox/search-js-core';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { FC, Fragment } from 'react';

import {
  useForm,
  SubmitHandler,
  FieldError,
  UseFormRegister,
  FieldErrors,
  UseFormSetValue,
} from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import FormError from '../ui/forms/FormError';
import FormInfo from '../ui/forms/FormInfo';
import FormLabel from '../ui/forms/FormLabel';
import FormSegment from '../ui/forms/FormSegment';
import FormTextArea from '../ui/forms/FormTextArea';
import FormTextInput from '../ui/forms/FormTextInput';
import Button from '../ui/forms/Button';

const AddressAutofill = dynamic(
  // @ts-ignore
  () => import('@mapbox/search-js-react').then((mod) => mod.AddressAutofill),
  { ssr: false },
);
const CreateBreweryPostWithImagesSchema = CreateBreweryPostSchema.merge(
  UploadImageValidationSchema,
);

const InfoSection: FC<{
  register: UseFormRegister<z.infer<typeof CreateBreweryPostWithImagesSchema>>;
  errors: FieldErrors<z.infer<typeof CreateBreweryPostWithImagesSchema>>;
  isSubmitting: boolean;
}> = ({ register, errors, isSubmitting }) => {
  return (
    <>
      <FormInfo>
        <FormLabel htmlFor="name">Name</FormLabel>
        <FormError>{errors.name?.message}</FormError>
      </FormInfo>
      <FormSegment>
        <FormTextInput
          placeholder="Lorem Ipsum Brewing Company"
          formValidationSchema={register('name')}
          error={!!errors.name}
          type="text"
          id="name"
          disabled={isSubmitting}
        />
      </FormSegment>
      <FormInfo>
        <FormLabel htmlFor="description">Description</FormLabel>
        <FormError>{errors.description?.message}</FormError>
      </FormInfo>
      <FormSegment>
        <FormTextArea
          placeholder="We make beer, and we make it good."
          formValidationSchema={register('description')}
          error={!!errors.description}
          rows={4}
          id="description"
          disabled={isSubmitting}
        />
      </FormSegment>
      <FormInfo>
        <FormLabel htmlFor="dateEstablished">Date Established</FormLabel>
        <FormError>{errors.dateEstablished?.message}</FormError>
      </FormInfo>
      <FormSegment>
        <FormTextInput
          placeholder="2021-01-01"
          formValidationSchema={register('dateEstablished')}
          error={!!errors.dateEstablished}
          type="date"
          id="dateEstablished"
          disabled={isSubmitting}
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
    </>
  );
};

const LocationSection: FC<{
  register: UseFormRegister<z.infer<typeof CreateBreweryPostWithImagesSchema>>;
  errors: FieldErrors<z.infer<typeof CreateBreweryPostWithImagesSchema>>;
  isSubmitting: boolean;
  setValue: UseFormSetValue<z.infer<typeof CreateBreweryPostWithImagesSchema>>;
}> = ({ register, errors, isSubmitting, setValue }) => {
  const onAutoCompleteChange = (address: string) => {
    setValue('address', address);
  };

  const onAutoCompleteRetrieve = (address: AddressAutofillRetrieveResponse) => {
    const { country, region, place } = address.features[0].properties as unknown as {
      country?: string;
      region?: string;
      place?: string;
    };

    setValue('country', country);
    setValue('region', region);
    setValue('city', place!);
  };

  return (
    <>
      <FormInfo>
        <FormLabel htmlFor="address">Address</FormLabel>
        <FormError>{errors.address?.message}</FormError>
      </FormInfo>
      <FormSegment>
        <AddressAutofill
          accessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!}
          onRetrieve={onAutoCompleteRetrieve}
          onChange={onAutoCompleteChange}
        >
          <input
            id="address"
            type="text"
            placeholder="1234 Main St"
            className={`input-bordered input w-full appearance-none rounded-lg transition ease-in-out ${
              errors.address?.message ? 'input-error' : ''
            }`}
            {...register('address')}
            disabled={isSubmitting}
          />
        </AddressAutofill>
      </FormSegment>
      <div className="flex space-x-3">
        <div className="w-1/2">
          <FormInfo>
            <FormLabel htmlFor="city">City</FormLabel>
            <FormError>{errors.city?.message}</FormError>
          </FormInfo>
          <FormSegment>
            <FormTextInput
              placeholder="Toronto"
              formValidationSchema={register('city')}
              error={!!errors.city}
              type="text"
              id="city"
              disabled={isSubmitting}
            />
          </FormSegment>
        </div>
        <div className="w-1/2">
          <FormInfo>
            <FormLabel htmlFor="region">Region</FormLabel>
            <FormError>{errors.region?.message}</FormError>
          </FormInfo>
          <FormSegment>
            <FormTextInput
              placeholder="Ontario"
              formValidationSchema={register('region')}
              error={!!errors.region}
              type="text"
              id="region"
              disabled={isSubmitting}
            />
          </FormSegment>
        </div>
      </div>
      <FormInfo>
        <FormLabel htmlFor="country">Country</FormLabel>
        <FormError>{errors.country?.message}</FormError>
      </FormInfo>
      <FormSegment>
        <FormTextInput
          placeholder="Canada"
          formValidationSchema={register('country')}
          error={!!errors.country}
          type="text"
          id="country"
          disabled={isSubmitting}
        />
      </FormSegment>
    </>
  );
};

const CreateBreweryPostForm: FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof CreateBreweryPostWithImagesSchema>>({
    resolver: zodResolver(CreateBreweryPostWithImagesSchema),
  });

  const router = useRouter();

  const onSubmit: SubmitHandler<
    z.infer<typeof CreateBreweryPostWithImagesSchema>
  > = async (data) => {
    const loadingToast = toast.loading('Creating brewery...');
    try {
      if (!(data.images instanceof FileList)) {
        return;
      }
      const breweryPost = await sendCreateBreweryPostRequest(data);
      await sendUploadBreweryImagesRequest({ breweryPost, images: data.images });
      await router.push(`/breweries/${breweryPost.id}`);
      toast.remove(loadingToast);
      toast.success('Created brewery.');
    } catch (error) {
      toast.remove(loadingToast);
      createErrorToast(error);
      reset();
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (error) => {
        const fieldErrors = Object.keys(error).length;

        toast.error(`Form submission failed.`);
        toast.error(`You have ${fieldErrors} errors in your form.`);
      })}
      className="form-control"
      autoComplete="off"
    >
      <Tab.Group as={Fragment}>
        <Tab.List className="tabs tabs-boxed items-center justify-center rounded-2xl">
          <Tab className="tab tab-md w-1/2 uppercase ui-selected:tab-active">
            Information
          </Tab>
          <Tab className="tab tab-md w-1/2 uppercase ui-selected:tab-active">
            Location
          </Tab>
        </Tab.List>
        <Tab.Panels className="mt-4">
          <Tab.Panel>
            <InfoSection
              register={register}
              errors={errors}
              isSubmitting={isSubmitting}
            />
          </Tab.Panel>
          <Tab.Panel>
            <LocationSection
              setValue={setValue}
              register={register}
              errors={errors}
              isSubmitting={isSubmitting}
            />
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
      <div className="mt-8">
        <Button type="submit" isSubmitting={isSubmitting}>
          Create Brewery Post
        </Button>
      </div>
    </form>
  );
};

export default CreateBreweryPostForm;
