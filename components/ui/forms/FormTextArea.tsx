import { FunctionComponent } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface FormTextAreaProps {
  placeholder?: string;
  formValidationSchema: UseFormRegisterReturn<string>;
  error: boolean;
  id: string;
  rows: number;
}

/**
 * @example
 *   <FormTextArea
 *     id="test"
 *     formValidationSchema={register('test')}
 *     error={true}
 *     placeholder="Test"
 *     rows={5}
 *   />;
 *
 * @param props
 * @param props.placeholder The placeholder text for the textarea.
 * @param props.formValidationSchema The form register hook from react-hook-form.
 * @param props.error Whether or not the textarea has an error.
 * @param props.id The id of the textarea.
 * @param props.rows The number of rows to display in the textarea.
 */
const FormTextArea: FunctionComponent<FormTextAreaProps> = ({
  placeholder = '',
  formValidationSchema,
  error,
  id,
  rows,
}) => (
  <textarea
    id={id}
    placeholder={placeholder}
    className={`textarea-bordered textarea m-0 w-full  resize-none rounded-lg border border-solid bg-clip-padding transition ease-in-out  ${
      error ? 'textarea-error' : ''
    }`}
    {...formValidationSchema}
    rows={rows}
  />
);

export default FormTextArea;
