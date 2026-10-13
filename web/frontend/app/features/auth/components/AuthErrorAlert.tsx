interface AuthErrorAlertProps {
    message: string;
}

const AuthErrorAlert = ({ message }: AuthErrorAlertProps) => (
    <div role="alert" className="alert alert-error alert-soft">
        <span>{message}</span>
    </div>
);

export default AuthErrorAlert;
