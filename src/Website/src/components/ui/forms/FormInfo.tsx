import { FunctionComponent, ReactNode } from 'react';

interface FormInfoProps {
  children: [ReactNode, ReactNode];
}

/**
 * @example
 *   <FormInfo>
 *     <FormLabel htmlFor="name">Name</FormLabel>
 *     <FormError>{errors.name?.message}</FormError>
 *   </FormInfo>;
 */
const FormInfo: FunctionComponent<FormInfoProps> = ({ children }) => (
  <div className="flex justify-between">{children}</div>
);

export default FormInfo;
