import { FunctionComponent, ReactNode } from 'react';

/** A container for both the form error and form label. */
interface FormInfoProps {
  children: Array<ReactNode> | ReactNode;
}

const FormInfo: FunctionComponent<FormInfoProps> = ({ children }) => (
  <div className="flex justify-between">{children}</div>
);

export default FormInfo;
