import ToastContext from '@/contexts/ToastContext';
import { FC, ReactNode } from 'react';
import toast, { Toast, Toaster, resolveValue } from 'react-hot-toast';
import { FaTimes } from 'react-icons/fa';

const toastToClassName = (toastType: Toast['type']) => {
  let className: 'alert-success' | 'alert-error' | 'alert-info';

  switch (toastType) {
    case 'success':
      className = 'alert-success';
      break;
    case 'error':
      className = 'alert-error';
      break;
    default:
      className = 'alert-info';
  }

  return className;
};

const CustomToast: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ToastContext.Provider value={{ toast }}>
      <Toaster>
        {(t) => {
          const alertType = toastToClassName(t.type);
          return (
            <div className="flex w-full items-center justify-center">
              <div
                className={`alert ${alertType} w-11/12 flex-row items-center py-[0.5rem] shadow-lg animate-in fade-in duration-200 lg:w-6/12`}
              >
                <div>{resolveValue(t.message, t)}</div>
                <button
                  className="btn-ghost btn-circle btn"
                  onClick={() => toast.dismiss(t.id)}
                >
                  <FaTimes />
                </button>
              </div>
            </div>
          );
        }}
      </Toaster>
      {children}
    </ToastContext.Provider>
  );
};
export default CustomToast;
