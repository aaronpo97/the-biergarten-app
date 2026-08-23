import { Link } from 'react-router';
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
                            <Link
                                key={brewery.breweryPostId}
                                to={`/breweries/${brewery.breweryPostId}`}
                                className="card bg-base-100 shadow hover:shadow-lg transition-shadow"
                            >
                                <div className="card-body">
                                    <h2 className="card-title">{brewery.breweryName}</h2>
                                    <p className="text-base-content/70 line-clamp-3">
                                        {brewery.description}
                                    </p>
                                    {brewery.location && (
                                        <p className="text-sm text-base-content/50 mt-2">
                                            {brewery.location.addressLine1}
                                            {brewery.location.addressLine2
                                                ? `, ${brewery.location.addressLine2}`
                                                : ''}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Breweries;
