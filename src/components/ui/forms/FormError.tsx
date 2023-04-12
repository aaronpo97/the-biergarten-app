import { FunctionComponent } from 'react';

/**
 * @example
 *   <FormError>Something went wrong!</FormError>;
 */
const FormError: FunctionComponent<{ children: string | undefined }> = ({ children }) =>
  children ? (
    <div
      className="my-1 h-3 text-xs font-semibold italic text-error-content"
      role="alert"
    >
      {children}
    </div>
  ) : null;
export default FormError;
