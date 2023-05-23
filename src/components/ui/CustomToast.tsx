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
    <>
      <Toaster position="bottom-center">
        {(t) => {
          const alertType = toastToClassName(t.type);
          return (
            <div
              className={`alert ${alertType} w-11/12 flex-row items-center shadow-lg animate-in fade-in duration-200 lg:w-6/12`}
            >
              <p>{resolveValue(t.message, t)}</p>
              {t.type !== 'loading' && (
                <div>
                  <button
                    className="btn-ghost btn-xs btn-circle btn"
                    onClick={() => toast.dismiss(t.id)}
                  >
                    <FaTimes />
                  </button>
                </div>
              )}
            </div>
          );
        }}
      </Toaster>
      {children}
    </>
  );
};
export default CustomToast;
