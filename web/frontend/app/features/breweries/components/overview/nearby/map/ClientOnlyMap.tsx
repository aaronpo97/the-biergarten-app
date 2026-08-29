import ClientOnly from '../../../../../../components/ClientOnly';

const MAP_PLACEHOLDER_CLASS = 'skeleton min-h-[30rem] h-full w-full rounded-box';

interface ClientOnlyMapProps {
    render: () => React.JSX.Element;
}

const ClientOnlyMap = ({ render }: ClientOnlyMapProps) => {
    return <ClientOnly fallback={<div className={MAP_PLACEHOLDER_CLASS} />}>{render}</ClientOnly>;
};

export default ClientOnlyMap;
export { MAP_PLACEHOLDER_CLASS };
