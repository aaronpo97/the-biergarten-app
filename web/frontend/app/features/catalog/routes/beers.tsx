import type { Route } from './+types/beers';

export const meta = ({}: Route.MetaArgs) => {
    return [{ title: 'Beers | The Biergarten App' }];
};

const Beers = () => {
    return (
        <div className="min-h-screen bg-base-200">
            <div className="container mx-auto p-4">
                <h1 className="text-4xl font-bold mb-4">Beers</h1>
                <p className="text-base-content/70">Explore our collection of beers.</p>
            </div>
        </div>
    );
};

export default Beers;
