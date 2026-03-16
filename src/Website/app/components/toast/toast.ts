import toast from 'react-hot-toast';

export const showSuccessToast = (message: string) => toast.success(message);
export const showErrorToast = (message: string) => toast.error(message);
export const showInfoToast = (message: string) => toast(message);
export const dismissToasts = () => toast.dismiss();
