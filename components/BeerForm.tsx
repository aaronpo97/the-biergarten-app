import { NewBeerInfo } from '@/pages/api/beers/create';
import BreweryPostQueryResult from '@/services/BreweryPost/types/BreweryPostQueryResult';
import { BeerType } from '@prisma/client';

import { FunctionComponent } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import Button from './ui/Button';
import FormError from './ui/forms/FormError';
import FormInfo from './ui/forms/FormInfo';
import FormLabel from './ui/forms/FormLabel';
import FormSegment from './ui/forms/FormSegment';
import FormSelect from './ui/forms/FormSelect';
import FormTextArea from './ui/forms/FormTextArea';
import FormTextInput from './ui/forms/FormTextInput';

type IFormInput = z.infer<typeof NewBeerInfo>;

interface BeerFormProps {
  type: 'edit' | 'create';
  // eslint-disable-next-line react/require-default-props
  defaultValues?: IFormInput;
  breweries?: BreweryPostQueryResult[];
  types?: BeerType[];
}

const sendCreateBeerPostRequest = async (data: IFormInput) => {
  // const body = JSON.stringify(data);

  const response = await fetch('/api/beers/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const json = await response.json();

  console.log(json);
};

const BeerForm: FunctionComponent<BeerFormProps> = ({
  type,
  defaultValues,
  breweries = [],
  types = [],
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IFormInput>({
    defaultValues: {
      name: defaultValues?.name,
      description: defaultValues?.description,
      abv: defaultValues?.abv,
      ibu: defaultValues?.ibu,
    },
  });

  // const navigate = useNavigate();

  const nameValidationSchema = register('name', {
    required: 'Beer name is required.',
  });
  const breweryValidationSchema = register('breweryId', {
    required: 'Brewery name is required.',
  });
  const abvValidationSchema = register('abv', {
    required: 'ABV is required.',
    valueAsNumber: true,
    max: { value: 50, message: 'ABV must be less than 50%.' },
    min: {
      value: 0.1,
      message: 'ABV must be greater than 0.1%',
    },
    validate: (abv) => !Number.isNaN(abv) || 'ABV is invalid.',
  });
  const ibuValidationSchema = register('ibu', {
    required: 'IBU is required.',
    min: {
      value: 2,
      message: 'IBU must be greater than 2.',
    },
    valueAsNumber: true,
    validate: (ibu) => !Number.isNaN(ibu) || 'IBU is invalid.',
  });

  const descriptionValidationSchema = register('description', {
    required: 'Description is required.',
  });

  const typeIdValidationSchema = register('typeId', {
    required: 'Type is required.',
  });

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    switch (type) {
      case 'create':
        await sendCreateBeerPostRequest(data);
        break;
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
          formValidationSchema={nameValidationSchema}
          error={!!errors.name}
          type="text"
          id="name"
        />
      </FormSegment>
      {type === 'create' && breweries.length && (
        <>
          <FormInfo>
            <FormLabel htmlFor="breweryId">Brewery</FormLabel>
            <FormError>{errors.breweryId?.message}</FormError>
          </FormInfo>
          <FormSegment>
            <FormSelect
              formRegister={breweryValidationSchema}
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
            formValidationSchema={abvValidationSchema}
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
            formValidationSchema={ibuValidationSchema}
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
          formValidationSchema={descriptionValidationSchema}
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
          formRegister={typeIdValidationSchema}
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
        type === 'edit'
          ? `Edit ${defaultValues?.name || 'beer post'}`
          : 'Create beer post'
      } `}</Button>
    </form>
  );
};

export default BeerForm;
