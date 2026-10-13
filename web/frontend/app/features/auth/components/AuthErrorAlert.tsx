interface AuthErrorAlertProps {
    message: string;
    /** Per-field messages to list beneath the summary. */
    details?: readonly string[];
}

const AuthErrorAlert = ({ message, details }: AuthErrorAlertProps) => (
    <div role="alert" className="alert alert-error alert-soft flex-col items-start">
        <span>{message}</span>

        {details?.length ? (
            <ul className="list-inside list-disc text-sm">
                {details.map((detail) => (
                    <li key={detail}>{detail}</li>
                ))}
            </ul>
        ) : null}
    </div>
);

export default AuthErrorAlert;
