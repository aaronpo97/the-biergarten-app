import { FunctionComponent } from 'react';

interface FormButtonProps {
  children: string;
  type: 'button' | 'submit' | 'reset';
  className?: string;
}

const Button: FunctionComponent<FormButtonProps> = ({ children, type, className }) => (
  // eslint-disable-next-line react/button-has-type
  <button type={type} className="btn-primary btn mt-4 w-full rounded-xl">
    {children}
  </button>
);

Button.defaultProps = {
  className: '',
};

export default Button;
