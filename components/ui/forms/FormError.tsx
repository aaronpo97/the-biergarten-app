import { FunctionComponent } from 'react';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';

/**
 * Component for a styled form error message.
 *
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
