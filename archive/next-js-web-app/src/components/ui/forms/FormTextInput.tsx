/* eslint-disable react/require-default-props */
import { FunctionComponent } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface FormInputProps {
  placeholder?: string;
  formValidationSchema: UseFormRegisterReturn<string>;
  error: boolean;
  // eslint-disable-next-line react/require-default-props
  type: 'email' | 'password' | 'text' | 'date';
  id: string;
  height?: string;
  disabled?: boolean;
  autoComplete?: string;
}

/**
 * @example
 *   <FormTextInput
 *     placeholder="Lorem Ipsum Lager"
 *     formValidationSchema={register('name')}
 *     error={!!errors.name}
 *     type="text"
 *     id="name"
 *     disabled
 *   />;
 *
 * @param param0 The props for the FormTextInput component
 * @param param0.placeholder The placeholder text for the input
 * @param param0.formValidationSchema The validation schema for the input, provided by
 *   react-hook-form.
 * @param param0.error Whether or not the input has an error.
 * @param param0.type The input type (email, password, text, date).
 * @param param0.id The id of the input.
 * @param param0.height The height of the input.
 * @param param0.disabled Whether or not the input is disabled.
 * @param param0.autoComplete The autocomplete value for the input.
 */
const FormTextInput: FunctionComponent<FormInputProps> = ({
  placeholder = '',
  formValidationSchema,
  error,
  type,
  id,
  disabled = false,
}) => (
  <input
    id={id}
    type={type}
    placeholder={placeholder}
    className={`input input-bordered w-full appearance-none rounded-lg transition ease-in-out ${
      error ? 'input-error' : ''
    }`}
    {...formValidationSchema}
    disabled={disabled}
  />
);

export default FormTextInput;
