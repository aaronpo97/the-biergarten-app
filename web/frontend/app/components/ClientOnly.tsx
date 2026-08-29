import { useSyncExternalStore, type ReactNode } from 'react';

interface ClientOnlyProps {
    children: () => ReactNode;
    fallback?: ReactNode;
}

const noop = () => undefined;
const emptySubscribe = () => noop;

const ClientOnly = ({ children, fallback = null }: ClientOnlyProps) => {
    const mounted = useSyncExternalStore(
        emptySubscribe,
        () => true,
        () => false,
    );

    return mounted ? children() : fallback;
};

export default ClientOnly;
