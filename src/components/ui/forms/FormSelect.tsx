import { FunctionComponent } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface FormSelectProps {
  options: readonly { value: string; text: string }[];
  id: string;
  formRegister: UseFormRegisterReturn<string>;
  error: boolean;
  placeholder: string;
  message: string;
  disabled?: boolean;
}

/**
 * @example
 *   <FormSelect
 *     options={[
 *       { value: '1', text: 'One' },
 *       { value: '2', text: 'Two' },
 *       { value: '3', text: 'Three' },
 *     ]}
 *     id="test"
 *     formRegister={register('test')}
 *     error={true}
 *     placeholder="Test"
 *     message="Select an option"
 *   />;
 *
 * @param props
 * @param props.options The options to display in the select.
 * @param props.id The id of the select.
 * @param props.formRegister The form register hook from react-hook-form.
 * @param props.error Whether or not the select has an error.
 * @param props.placeholder The placeholder text for the select.
 * @param props.message The message to display when no option is selected.
 */
const FormSelect: FunctionComponent<FormSelectProps> = ({
  options,
  id,
  error,
  formRegister,
  placeholder,
  message,
  disabled = false,
}) => (
  <select
    id={id}
    className={`select-bordered select block w-full rounded-lg ${
      error ? 'select-error' : ''
    }`}
    placeholder={placeholder}
    disabled={disabled}
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
