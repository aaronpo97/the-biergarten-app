import toast from 'react-hot-toast';

/** @param error - The error to display. Creates a toast message with the error message. */
const createErrorToast = (error: unknown) => {
  const errorMessage = error instanceof Error ? error.message : 'Something went wrong.';
  toast.error(errorMessage);
};

export default createErrorToast;
