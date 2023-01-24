import { FunctionComponent } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface FormSelectProps {
  options: ReadonlyArray<{ value: string; text: string }>;
  id: string;
  formRegister: UseFormRegisterReturn<string>;
  error: boolean;
  placeholder: string;
  message: string;
}

const FormSelect: FunctionComponent<FormSelectProps> = ({
  options,
  id,
  error,
  formRegister,
  placeholder,
  message,
}) => (
  <select
    id={id}
    className={`select select-bordered block w-full rounded-lg ${
      error ? 'select-error' : ''
    }`}
    placeholder={placeholder}
    {...formRegister}
  >
    <option value="">{message}</option>
    {options.map(({ value, text }) => (
      <option key={value} value={value}>
        {text}
      </option>
    ))}
  </select>
);

export default FormSelect;
