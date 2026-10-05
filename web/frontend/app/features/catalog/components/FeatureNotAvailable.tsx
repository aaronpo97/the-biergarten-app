import { Clock, Lock, Tools } from 'iconoir-react';
import type { ComponentType } from 'react';
import { Link } from 'react-router';

type Reason = 'soon' | 'maintenance' | 'auth';

interface Action {
    to: string;
    label: string;
    className: string;
}

interface Content {
    Icon: ComponentType<{ className?: string }>;
    title: string;
    description: string;
    actions: Action[];
}

const CONTENT: Record<Reason, Content> = {
    soon: {
        Icon: Clock,
        title: 'This feature is not available yet',
        description: 'This feature is still in development.',
        actions: [
            { to: '/breweries', label: 'Browse breweries', className: 'btn-primary' },
            { to: '/', label: 'Back to home', className: 'btn-ghost' },
        ],
    },
    maintenance: {
        Icon: Tools,
        title: 'This feature is temporarily unavailable',
        description: 'This feature is offline for maintenance. Try again in a few minutes.',
        actions: [],
    },
    auth: {
        Icon: Lock,
        title: 'Sign in to use this feature',
        description:
            'This feature requires a valid session. Log in or create an account to continue.',
        actions: [
            { to: '/login', label: 'Login', className: 'btn-primary' },
            { to: '/register', label: 'Register', className: 'btn-outline' },
        ],
    },
};

interface FeatureNotAvailableProps {
    reason?: Reason;
}

const FeatureNotAvailable = ({ reason = 'soon' }: FeatureNotAvailableProps) => {
    const { Icon, title, description, actions } = CONTENT[reason];

    return (
        <section className="flex flex-col items-center gap-3 rounded-box border border-base-300 bg-base-100 px-6 py-12 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-base-200 text-base-content/70">
                <Icon className="size-6" />
            </div>
            <div className="flex max-w-md flex-col gap-2">
                <h2 className="font-serif text-2xl font-bold leading-tight">{title}</h2>
                <p className="text-base-content/70 text-pretty">{description}</p>
            </div>
            {actions.length > 0 && (
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                    {actions.map(({ to, label, className }) => (
                        <Link key={to} to={to} className={`btn btn-sm ${className}`}>
                            {label}
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
};

export default FeatureNotAvailable;
