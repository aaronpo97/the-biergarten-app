import { Toaster } from 'react-hot-toast';

const ToastProvider = () => {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 3500,
                className:
                    'rounded-box border border-base-300 bg-base-100 text-base-content shadow-lg',
                success: {
                    iconTheme: {
                        primary: 'var(--color-success)',
                        secondary: 'var(--color-success-content)',
                    },
                },
                error: {
                    iconTheme: {
                        primary: 'var(--color-error)',
                        secondary: 'var(--color-error-content)',
                    },
                },
            }}
        />
    );
};

export default ToastProvider;
