/* eslint-disable react/require-default-props */
import { FunctionComponent } from 'react';
import { FieldError, UseFormRegisterReturn } from 'react-hook-form';

interface FormInputProps {
  placeholder?: string;
  formValidationSchema: UseFormRegisterReturn<string>;
  error: boolean;
  // eslint-disable-next-line react/require-default-props
  type: 'email' | 'password' | 'text' | 'date';
  id: string;
  height?: string;
}

const FormTextInput: FunctionComponent<FormInputProps> = ({
  placeholder = '',
  formValidationSchema,
  error,
  type,
  id,
}) => (
  <input
    id={id}
    type={type}
    placeholder={placeholder}
    className={`input w-full transition ease-in-out rounded-lg input-bordered ${
      error ? 'input-error' : ''
    }`}
    {...formValidationSchema}
  />
);

export default FormTextInput;
