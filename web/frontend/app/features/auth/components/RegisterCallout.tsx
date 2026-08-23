import { HomeSimpleDoor, UserPlus } from 'iconoir-react';
import { Link } from 'react-router';

const RegisterCallout = () => (
    <>
        <div className="divider text-xs">New here?</div>
        <div className="text-center space-y-2">
            <Link to="/register" className="btn btn-outline btn-sm w-full gap-2">
                <UserPlus className="size-4" aria-hidden="true" />
                Create an account
            </Link>
            <Link
                to="/"
                className="link link-hover text-sm text-base-content/60 inline-flex items-center gap-1"
            >
                <HomeSimpleDoor className="size-4" aria-hidden="true" />
                Back to home
            </Link>
        </div>
    </>
);

export default RegisterCallout;
