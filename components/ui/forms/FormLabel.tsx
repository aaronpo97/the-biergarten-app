import { FunctionComponent } from 'react';

interface FormLabelProps {
  htmlFor: string;
  children: string;
}

const FormLabel: FunctionComponent<FormLabelProps> = ({ htmlFor, children }) => (
  <label
    className="block uppercase tracking-wide text-sm sm:text-xs font-extrabold my-1"
    htmlFor={htmlFor}
  >
    {children}
  </label>
);

export default FormLabel;
