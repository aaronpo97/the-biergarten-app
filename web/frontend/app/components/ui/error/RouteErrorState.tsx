import { isRouteErrorResponse } from 'react-router';

const RouteErrorState = ({ error }: { error: unknown }) => {
    let title = 'Something went wrong';
    let message = 'An unexpected error occurred.';

    if (isRouteErrorResponse(error)) {
        title = error.status === 503 ? 'Service unavailable' : `Error ${error.status}`;
        message =
            typeof error.data === 'string' && error.data ? error.data : error.statusText || message;
    } else if (import.meta.env.DEV && error instanceof Error) {
        message = error.message;
    }

    return (
        <div className="min-h-[50vh] flex items-center justify-center p-4">
            <div
                role="alert"
                className="alert alert-error alert-soft max-w-md flex-col items-start gap-2"
            >
                <span className="font-semibold">{title}</span>
                <span>{message}</span>
                <button
                    type="button"
                    className="btn btn-sm btn-outline mt-2"
                    onClick={() => window.location.reload()}
                >
                    Try again
                </button>
            </div>
        </div>
    );
};

export default RouteErrorState;
