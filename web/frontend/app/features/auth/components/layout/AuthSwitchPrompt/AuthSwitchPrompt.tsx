import { Link } from 'react-router';

interface AuthSwitchPromptProps {
    lead: string;
    to: string;
    label: string;
}

const AuthSwitchPrompt = ({ lead, to, label }: AuthSwitchPromptProps) => (
    <p className="flex flex-wrap items-center justify-center gap-x-1.5 text-center text-[0.9375rem] text-[var(--color-muted)]">
        {lead}
        <Link
            to={to}
            className="inline-flex min-h-11 items-center font-semibold text-secondary hover:text-primary"
        >
            {label}
        </Link>
    </p>
);

export default AuthSwitchPrompt;
