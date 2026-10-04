import { getBreweries, type Brewery } from '../../breweries/breweries.server';
import { getOptionalAuth } from '../../auth/auth.server';
import ClosingCta from '../components/ClosingCta';
import FeatureHighlights from '../components/FeatureHighlights';
import HeroSection from '../components/HeroSection';
import LandingFooter from '../components/LandingFooter';
import PartnerBreweries from '../components/PartnerBreweries';
import ThemeTryOut from '../components/ThemeTryOut';
import type { Route } from './+types/home';

const PARTNER_BREWERY_COUNT = 3;

export const meta = ({}: Route.MetaArgs) => [
    { title: 'The Biergarten App' },
    {
        name: 'description',
        content:
            'Browse our partner breweries, see what they pour, and keep track of the beers you have tried.',
    },
];

export const loader = async ({ request }: Route.LoaderArgs) => {
    const auth = await getOptionalAuth(request);
    let recentBreweries: Brewery[] = [];

    const randomOffset = Math.random() * 1.0 
    try {
        recentBreweries = await getBreweries(PARTNER_BREWERY_COUNT, 0);
    } catch {
        recentBreweries = [];
    }

    return { isAuthenticated: auth !== null, recentBreweries };
};

const Home = ({ loaderData }: Route.ComponentProps) => {
    const { isAuthenticated, recentBreweries } = loaderData;

    return (
        <main className="bg-base-200 text-base-content">
            <HeroSection />
            <FeatureHighlights />
            <PartnerBreweries breweries={recentBreweries} />
            <ThemeTryOut />
            <ClosingCta />
            <LandingFooter isAuthenticated={isAuthenticated} />
        </main>
    );
};

export default Home;
