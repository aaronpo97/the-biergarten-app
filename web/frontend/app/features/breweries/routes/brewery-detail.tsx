import { data, Link } from 'react-router';
import { getBreweryById } from '../breweries.server';
import type { Route } from './+types/brewery-detail';

export const loader = async ({ params }: Route.LoaderArgs) => {
    const brewery = await getBreweryById(params.id);
    if (!brewery) {
        throw data('Brewery not found.', { status: 404 });
    }

    return { brewery };
};

const BreweryDetail = ({ loaderData }: Route.ComponentProps) => {
    const { brewery } = loaderData;

    return (
        <div className="min-h-screen bg-base-200">
            <div className="container mx-auto p-4 max-w-2xl">
                <Link
                    to="/breweries"
                    className="link link-hover text-sm text-base-content/60 mb-4 inline-block"
                >
                    &larr; Back to Breweries
                </Link>

                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <h1 className="card-title text-3xl">{brewery.breweryName}</h1>
                        <p className="text-base-content/70 whitespace-pre-line">
                            {brewery.description}
                        </p>

                        {brewery.location && (
                            <div className="bg-base-200 rounded-box p-4 mt-4">
                                <p className="text-xs font-semibold uppercase tracking-widest text-base-content/50 mb-2">
                                    Location
                                </p>
                                <p>{brewery.location.addressLine1}</p>
                                {brewery.location.addressLine2 && (
                                    <p>{brewery.location.addressLine2}</p>
                                )}
                                <p>{brewery.location.postalCode}</p>
                            </div>
                        )}

                        <p className="text-xs text-base-content/40 mt-4">
                            Posted {new Date(brewery.createdAt).toLocaleDateString()}
                            {brewery.updatedAt &&
                                ` · Updated ${new Date(brewery.updatedAt).toLocaleDateString()}`}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BreweryDetail;
