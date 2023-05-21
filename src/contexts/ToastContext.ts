import { createContext } from 'react';
import toast from 'react-hot-toast';

const ToastContext = createContext<{
  toast: typeof toast;
}>({ toast });

export default ToastContext;
