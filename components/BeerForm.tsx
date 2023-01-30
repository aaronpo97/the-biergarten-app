import BreweryPostQueryResult from '@/services/BreweryPost/types/BreweryPostQueryResult';
import { BeerType } from '@prisma/client';

import { FunctionComponent } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import BeerPostValidationSchema from '@/validation/CreateBeerPostValidationSchema';
import Router from 'next/router';
import sendCreateBeerPostRequest from '@/requests/sendCreateBeerPostRequest';
import Button from './ui/forms/Button';
import FormError from './ui/forms/FormError';
import FormInfo from './ui/forms/FormInfo';
import FormLabel from './ui/forms/FormLabel';
import FormSegment from './ui/forms/FormSegment';
import FormSelect from './ui/forms/FormSelect';
import FormTextArea from './ui/forms/FormTextArea';
import FormTextInput from './ui/forms/FormTextInput';

type BeerPostT = z.infer<typeof BeerPostValidationSchema>;

interface BeerFormProps {
  formType: 'edit' | 'create';
  // eslint-disable-next-line react/require-default-props
  defaultValues?: BeerPostT;
  breweries?: BreweryPostQueryResult[];
  types?: BeerType[];
}

const BeerForm: FunctionComponent<BeerFormProps> = ({
  formType,
  defaultValues,
  breweries = [],
  types = [],
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BeerPostT>({
    resolver: zodResolver(BeerPostValidationSchema),
    defaultValues: {
      name: defaultValues?.name,
      description: defaultValues?.description,
      abv: defaultValues?.abv,
      ibu: defaultValues?.ibu,
    },
  });

  const onSubmit: SubmitHandler<BeerPostT> = async (data) => {
    switch (formType) {
      case 'create': {
        try {
          const response = await sendCreateBeerPostRequest(data);
          Router.push(`/beers/${response.id}`);
          break;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e);
          break;
        }
      }
      case 'edit':
        break;
      default:
        break;
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
        />
      </FormSegment>
      {formType === 'create' && breweries.length && (
        <>
          <FormInfo>
            <FormLabel htmlFor="breweryId">Brewery</FormLabel>
            <FormError>{errors.breweryId?.message}</FormError>
          </FormInfo>
          <FormSegment>
            <FormSelect
              formRegister={register('breweryId')}
              error={!!errors.breweryId}
              id="breweryId"
              options={breweries.map((brewery) => ({
                value: brewery.id,
                text: brewery.name,
              }))}
              placeholder="Brewery"
              message="Pick a brewery"
            />
          </FormSegment>
        </>
      )}

      <div className="flex flex-wrap sm:text-xs md:mb-3">
        <div className="mb-2 w-full md:mb-0 md:w-1/2 md:pr-3">
          <FormInfo>
            <FormLabel htmlFor="abv">ABV</FormLabel>
            <FormError>{errors.abv?.message}</FormError>
          </FormInfo>
          <FormTextInput
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
          placeholder="Ratione cumque quas quia aut impedit ea culpa facere. Ut in sit et quas reiciendis itaque."
          error={!!errors.description}
          formValidationSchema={register('description')}
          id="description"
          rows={8}
        />
      </FormSegment>

      <FormInfo>
        <FormLabel htmlFor="typeId">Type</FormLabel>
        <FormError>{errors.typeId?.message}</FormError>
      </FormInfo>
      <FormSegment>
        <FormSelect
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

      <Button type="submit">{`${
        formType === 'edit'
          ? `Edit ${defaultValues?.name || 'beer post'}`
          : 'Create beer post'
      } `}</Button>
    </form>
  );
};

export default BeerForm;
