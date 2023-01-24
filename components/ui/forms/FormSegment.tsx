import { FunctionComponent } from 'react';

/** A container for both the form error and form label. */
interface FormInfoProps {
  children: Array<JSX.Element> | JSX.Element;
}

const FormSegment: FunctionComponent<FormInfoProps> = ({ children }) => (
  <div className="mb-2">{children}</div>
);

export default FormSegment;
