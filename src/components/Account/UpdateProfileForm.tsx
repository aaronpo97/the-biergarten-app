import FormError from '@/components/ui/forms/FormError';
import FormInfo from '@/components/ui/forms/FormInfo';
import FormLabel from '@/components/ui/forms/FormLabel';
import FormSegment from '@/components/ui/forms/FormSegment';
import Link from 'next/link';
import FormTextArea from '@/components/ui/forms/FormTextArea';
import { FC } from 'react';
import GetUserSchema from '@/services/users/User/schema/GetUserSchema';
import type {
  UseFormHandleSubmit,
  SubmitHandler,
  FieldErrors,
  UseFormRegister,
} from 'react-hook-form';
import { z } from 'zod';
import UpdateProfileSchema from '../../services/users/User/schema/UpdateProfileSchema';

type UpdateProfileSchemaT = z.infer<typeof UpdateProfileSchema>;

interface UpdateProfileFormProps {
  handleSubmit: UseFormHandleSubmit<UpdateProfileSchemaT>;
  onSubmit: SubmitHandler<UpdateProfileSchemaT>;
  errors: FieldErrors<UpdateProfileSchemaT>;
  isSubmitting: boolean;
  register: UseFormRegister<UpdateProfileSchemaT>;
  user: z.infer<typeof GetUserSchema>;
}

const UpdateProfileForm: FC<UpdateProfileFormProps> = ({
  handleSubmit,
  onSubmit,
  errors,
  isSubmitting,
  register,
  user,
}) => {
  return (
    <form className="form-control space-y-1" noValidate onSubmit={handleSubmit(onSubmit)}>
      <div>
        <FormInfo>
          <FormLabel htmlFor="userAvatar">Avatar</FormLabel>
          <FormError>{errors.userAvatar?.message}</FormError>
        </FormInfo>
        <FormSegment>
          <input
            disabled={isSubmitting}
            type="file"
            id="userAvatar"
            className="file-input file-input-bordered w-full"
            {...register('userAvatar')}
            multiple={false}
          />
        </FormSegment>
      </div>
      <div>
        <FormInfo>
          <FormLabel htmlFor="bio">Bio</FormLabel>
          <FormError>{errors.bio?.message}</FormError>
        </FormInfo>

        <FormSegment>
          <FormTextArea
            disabled={isSubmitting}
            id="bio"
            {...register('bio')}
            rows={5}
            formValidationSchema={register('bio')}
            error={!!errors.bio}
            placeholder="Bio"
          />
        </FormSegment>
      </div>
      <div className="mt-6 flex w-full flex-col justify-center space-y-3">
        <Link
          className={`btn btn-secondary rounded-xl ${isSubmitting ? 'btn-disabled' : ''}`}
          href={`/users/${user?.id}`}
        >
          Cancel Changes
        </Link>

        <button
          className="btn btn-primary w-full rounded-xl"
          type="submit"
          disabled={isSubmitting}
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default UpdateProfileForm;
