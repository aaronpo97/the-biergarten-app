import { Dispatch, FC, SetStateAction } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

interface ErrorAlertProps {
  error: string;
  setError: Dispatch<SetStateAction<string>>;
}

const ErrorAlert: FC<ErrorAlertProps> = ({ error, setError }) => {
  return (
    <div className="alert alert-error shadow-lg">
      <div>
        <FiAlertTriangle className="h-6 w-6" />
        <span>{error}</span>
      </div>

      <div className="flex-none">
        <button
          className="btn btn-ghost btn-sm"
          type="button"
          onClick={() => {
            setError('');
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default ErrorAlert;
