import { Link } from 'react-router';

interface AuthSwitchPromptProps {
    lead: string;
    to: string;
    label: string;
}

const AuthSwitchPrompt = ({ lead, to, label }: AuthSwitchPromptProps) => (
    <p className="text-center text-[0.9375rem] text-[var(--color-muted)]">
        {lead}{' '}
        <Link to={to} className="font-semibold text-secondary hover:text-primary">
            {label}
        </Link>
    </p>
);

export default AuthSwitchPrompt;
