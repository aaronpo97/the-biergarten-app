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
    className={`btn-primary btn w-full rounded-xl`}
    disabled={isSubmitting}
  >
    {children}
  </button>
);

export default Button;
