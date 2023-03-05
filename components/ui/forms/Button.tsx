import { FunctionComponent } from 'react';

interface FormButtonProps {
  children: string;
  type: 'button' | 'submit' | 'reset';
  isSubmitting?: boolean;
}

const Button: FunctionComponent<FormButtonProps> = ({
  children,
  type,
  isSubmitting = false,
}) => (
  // eslint-disable-next-line react/button-has-type
  <button
    type={type}
    className={`btn btn-primary w-full rounded-xl ${isSubmitting ? 'loading' : ''}`}
  >
    {children}
  </button>
);

export default Button;
