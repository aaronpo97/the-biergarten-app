import { FunctionComponent } from 'react';

interface FormLabelProps {
  htmlFor: string;
  children: string;
}

/**
 * @example
 *   <FormLabel htmlFor="name">Name</FormLabel>;
 */
const FormLabel: FunctionComponent<FormLabelProps> = ({ htmlFor, children }) => (
  <label
    className="my-1 block text-xs font-extrabold uppercase tracking-wide lg:text-sm"
    htmlFor={htmlFor}
  >
    {children}
  </label>
);

export default FormLabel;
