import { FunctionComponent } from 'react';
import { UseFormRegisterReturn } from 'react-hook-form';

interface FormTextAreaProps {
  placeholder?: string;
  formValidationSchema: UseFormRegisterReturn<string>;
  error: boolean;
  id: string;
  rows: number;
  className?: string;
}

const FormTextArea: FunctionComponent<FormTextAreaProps> = ({
  placeholder = '',
  formValidationSchema,
  error,
  id,
  rows,
  className,
}) => (
  <textarea
    id={id}
    placeholder={placeholder}
    className={`${className} textarea textarea-bordered w-full resize-none  rounded-lg bg-clip-padding border border-solid transition ease-in-out m-0  ${
      error ? 'textarea-error' : ''
    }`}
    {...formValidationSchema}
    rows={rows}
  />
);

FormTextArea.defaultProps = {
  placeholder: '',
  className: '',
};

export default FormTextArea;
