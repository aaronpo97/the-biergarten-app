import { Link } from 'react-router';

const LoginCallout = () => (
    <>
        <div className="divider text-xs">Already have an account?</div>

        <div className="text-center space-y-2">
            <Link to="/login" className="btn btn-outline btn-sm w-full">
                Sign in
            </Link>
            <Link to="/" className="link link-hover text-sm text-base-content/60">
                Back to home
            </Link>
        </div>
    </>
);

export default LoginCallout;
