import Button from '@/components/ui/forms/Button';
import FormError from '@/components/ui/forms/FormError';
import FormInfo from '@/components/ui/forms/FormInfo';
import FormLabel from '@/components/ui/forms/FormLabel';
import FormPageLayout from '@/components/ui/forms/FormPageLayout';
import FormSegment from '@/components/ui/forms/FormSegment';
import FormTextArea from '@/components/ui/forms/FormTextArea';
import FormTextInput from '@/components/ui/forms/FormTextInput';

import createErrorToast from '@/util/createErrorToast';
import withPageAuthRequired from '@/util/withPageAuthRequired';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import type { AddressAutofillRetrieveResponse } from '@mapbox/search-js-core';
import { GetServerSideProps, NextPage } from 'next';
import Head from 'next/head';
import { FieldError, SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { FaBeer } from 'react-icons/fa';
import { z } from 'zod';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import BreweryPostQueryResult from '@/services/BreweryPost/types/BreweryPostQueryResult';
import CreateBreweryPostSchema from '@/services/BreweryPost/types/CreateBreweryPostSchema';
import UploadImageValidationSchema from '@/services/types/ImageSchema/UploadImageValidationSchema';
import sendUploadBreweryImagesRequest from '@/requests/BreweryImage/sendUploadBreweryImageRequest';

const AddressAutofill = dynamic(
  // @ts-expect-error
  () => import('@mapbox/search-js-react').then((mod) => mod.AddressAutofill),
  { ssr: false },
);
const CreateBreweryPostWithImagesSchema = CreateBreweryPostSchema.merge(
  UploadImageValidationSchema,
);

const sendCreateBreweryPostRequest = async (
  data: z.infer<typeof CreateBreweryPostSchema>,
) => {
  const response = await fetch('/api/breweries/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const json = await response.json();

  const parsed = APIResponseValidationSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error('API response parsing failed');
  }

  const parsedPayload = BreweryPostQueryResult.safeParse(parsed.data.payload);
  if (!parsedPayload.success) {
    throw new Error('API response payload parsing failed');
  }

  return parsedPayload.data;
};

const CreateBreweryPage: NextPage = () => {
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
      reset();
      createErrorToast(error);
    }
  };

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
      <Head>
        <title>Create Brewery</title>
      </Head>
      <div className="flex w-full flex-col items-center justify-center">
        <div className="w-full">
          <FormPageLayout
            backLink="/breweries"
            backLinkText="Back to Breweries"
            headingText="Create Brewery"
            headingIcon={FaBeer}
          >
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="form-control"
              autoComplete="off"
            >
              <div>
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
                  <FormError>
                    {(errors.images as FieldError | undefined)?.message}
                  </FormError>
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
              </div>

              <div>
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
              </div>
              <div className="mt-4">
                <Button type="submit" isSubmitting={isSubmitting}>
                  Create Brewery Post
                </Button>
              </div>
            </form>
          </FormPageLayout>
        </div>
      </div>
    </>
  );
};

export default CreateBreweryPage;

export const getServerSideProps: GetServerSideProps = withPageAuthRequired();
