import { Button } from '@headlessui/react';

interface ShowPasswordToggleProps {
    shown: boolean;
    onToggle: () => void;
}

const ShowPasswordToggle = ({ shown, onToggle }: ShowPasswordToggleProps) => (
    <Button
        type="button"
        onClick={onToggle}
        className="inline-flex min-h-11 items-center self-start text-[0.9375rem] font-semibold text-secondary hover:underline"
    >
        {shown ? 'Hide password' : 'Show password'}
    </Button>
);

export default ShowPasswordToggle;
