import RouteErrorState from '../../../components/ui/error/RouteErrorState';
import BreweryCard from '../components/BreweryCard';
import { getBreweries } from '../breweries.server';
import type { Route } from './+types/breweries';

export const meta = ({}: Route.MetaArgs) => {
    return [{ title: 'Breweries | The Biergarten App' }];
};

export const loader = async () => {
    const breweries = await getBreweries();
    return { breweries };
};

const Breweries = ({ loaderData }: Route.ComponentProps) => {
    const { breweries } = loaderData;

    return (
        <div className="min-h-screen bg-base-200">
            <div className="container mx-auto p-4">
                <h1 className="text-4xl font-bold mb-4">Breweries</h1>
                <p className="text-base-content/70 mb-6">Discover our partner breweries.</p>

                {breweries.length === 0 ? (
                    <div className="alert alert-info alert-soft">
                        <span>No breweries have been posted yet.</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {breweries.map((brewery) => (
                            <BreweryCard key={brewery.breweryPostId} brewery={brewery} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Breweries;

export const ErrorBoundary = ({ error }: Route.ErrorBoundaryProps) => (
    <RouteErrorState error={error} />
);
