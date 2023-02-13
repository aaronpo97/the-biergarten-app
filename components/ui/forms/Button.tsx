import { FunctionComponent } from 'react';

interface FormButtonProps {
  children: string;
  type: 'button' | 'submit' | 'reset';
}

const Button: FunctionComponent<FormButtonProps> = ({ children, type }) => (
  // eslint-disable-next-line react/button-has-type
  <button type={type} className="btn-primary btn mt-4 w-full rounded-xl">
    {children}
  </button>
);

export default Button;
