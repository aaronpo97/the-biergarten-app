import FeatureNotAvailable from '../components/FeatureNotAvailable';
import type { Route } from './+types/beer-styles';

export const meta = ({}: Route.MetaArgs) => {
    return [{ title: 'Beer Styles | The Biergarten App' }];
};

const BeerStyles = () => {
    return (
        <div className="min-h-screen bg-base-200">
            <div className="mx-auto max-w-7xl px-5 pt-10">
                <h1 className="font-serif text-5xl font-bold leading-tight mb-4">Beer Styles</h1>
                <p className="text-base-content/70">Learn about different beer styles.</p>
                <div className="mt-8">
                    <FeatureNotAvailable />
                </div>
            </div>
        </div>
    );
};

export default BeerStyles;
