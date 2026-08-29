import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { expect, fireEvent, waitFor, within } from 'storybook/test';
import NearbyBreweriesSection from '../app/features/breweries/components/overview/nearby/NearbyBreweriesSection';
import type {
    BreweryLocation,
    SimplifiedBrewery,
} from '../app/features/breweries/breweries.server';

const nearbyBreweriesSectionDescription = `Requests geolocation (falling back to \`fallbackCenter\` when it's unavailable or denied, as it reliably is in headless browser tests), then loads nearby breweries via \`useFetcher().load()\` against the \`/breweries/nearby\` route, re-fetching whenever the debounced search radius changes. This harness runs the real component behind a \`createMemoryRouter\` with a fake loader for that route, keyed by the requested radius, so the \`Default\` story's play function can prove both the initial load and that rapid radius changes are debounced into a single re-fetch rather than one per step. The lazily-loaded Leaflet map mounts for real here (Storybook's client-only render means \`ClientOnly\` reports "mounted" immediately) and will issue real tile requests - the play function doesn't assert anything about it.`;

const portlandLocation: BreweryLocation = {
    breweryPostLocationId: 'loc-close',
    breweryPostId: 'brewery-close',
    cityId: 'city-1',
    cityName: 'Portland',
    stateProvinceName: 'Oregon',
    stateProvinceCode: 'OR',
    countryName: 'United States',
    countryCode: 'US',
    addressLine1: '123 Hop Street',
    addressLine2: null,
    postalCode: '97201',
    coordinates: { latitude: 45.52, longitude: -122.68 },
};

const closeQuarters: SimplifiedBrewery = {
    breweryPostId: 'brewery-close',
    breweryName: 'Close Quarters Brewing',
    location: portlandLocation,
    distanceMetres: 4800,
};

const midrangeMalts: SimplifiedBrewery = {
    breweryPostId: 'brewery-mid',
    breweryName: 'Midrange Malts',
    location: {
        ...portlandLocation,
        breweryPostLocationId: 'loc-mid',
        breweryPostId: 'brewery-mid',
        cityName: 'Salem',
        coordinates: { latitude: 44.94, longitude: -123.03 },
    },
    distanceMetres: 52000,
};

const farFlungFermentery: SimplifiedBrewery = {
    breweryPostId: 'brewery-far',
    breweryName: 'Far Flung Fermentery',
    location: {
        ...portlandLocation,
        breweryPostLocationId: 'loc-far',
        breweryPostId: 'brewery-far',
        cityName: 'Bend',
        coordinates: { latitude: 44.06, longitude: -121.31 },
    },
    distanceMetres: 138000,
};

const FALLBACK_CENTER = { latitude: 45.5152, longitude: -122.6784, label: 'Portland, OR' };

// Keyed by rangeInMetres so the play function can prove the radius slider
// drives refetches. DEFAULT_RADIUS_KM=120 -> 120000; MAX_RADIUS_KM=150 -> 150000.
const NEARBY_FIXTURES: Record<number, SimplifiedBrewery[]> = {
    30000: [closeQuarters],
    60000: [closeQuarters],
    90000: [closeQuarters, midrangeMalts],
    120000: [closeQuarters, midrangeMalts],
    150000: [closeQuarters, midrangeMalts, farFlungFermentery],
};

let fetchedRanges: number[] = [];

const NearbyBreweriesRoute = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    return (
        <NearbyBreweriesSection
            featured={null}
            fallbackCenter={FALLBACK_CENTER}
            selectedId={selectedId}
            onSelect={setSelectedId}
        />
    );
};

const NearbyBreweriesHarness = () => {
    const [router] = useState(() => {
        fetchedRanges = [];
        return createMemoryRouter([
            { path: '/', element: <NearbyBreweriesRoute /> },
            {
                path: '/breweries/nearby',
                loader: async ({ request }) => {
                    const rangeInMetres = Number(
                        new URL(request.url).searchParams.get('rangeInMetres'),
                    );
                    fetchedRanges.push(rangeInMetres);
                    return { breweries: NEARBY_FIXTURES[rangeInMetres] ?? [] };
                },
            },
        ]);
    });

    return <RouterProvider router={router} />;
};

const NearbyBreweriesEmptyHarness = () => {
    const [router] = useState(() =>
        createMemoryRouter([
            { path: '/', element: <NearbyBreweriesRoute /> },
            {
                path: '/breweries/nearby',
                loader: async () => ({ breweries: [] as SimplifiedBrewery[] }),
            },
        ]),
    );

    return <RouterProvider router={router} />;
};

const meta = {
    title: 'Breweries/NearbyBreweriesSection',
    component: NearbyBreweriesHarness,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        usesDataRouter: true,
        docs: {
            description: {
                component: nearbyBreweriesSectionDescription,
            },
        },
    },
} satisfies Meta<typeof NearbyBreweriesHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // Initial (undebounced) fetch at the default radius (120km -> 120000m).
        await waitFor(
            () => expect(canvas.getByText('Close Quarters Brewing')).toBeInTheDocument(),
            { timeout: 3000 },
        );
        await expect(canvas.getByText('Midrange Malts')).toBeInTheDocument();
        await expect(fetchedRanges).toEqual([120000]);

        // Simulate a fast drag through several intermediate values with no
        // waits in between.
        const radiusSlider = canvas.getByRole('slider', { name: /search radius/i });
        fireEvent.change(radiusSlider, { target: { value: '30' } });
        fireEvent.change(radiusSlider, { target: { value: '60' } });
        fireEvent.change(radiusSlider, { target: { value: '90' } });
        fireEvent.change(radiusSlider, { target: { value: '150' } });

        // The radius label updates immediately (it isn't debounced)...
        await expect(canvas.getByText('150 km')).toBeInTheDocument();
        // ...but no new fetch has fired yet - the 300ms debounce window hasn't elapsed.
        await expect(fetchedRanges).toEqual([120000]);

        // After the debounce window, exactly one more fetch happens, for the
        // final radius only - not one per intermediate step.
        await waitFor(() => expect(canvas.getByText('Far Flung Fermentery')).toBeInTheDocument(), {
            timeout: 3000,
        });
        await expect(fetchedRanges).toEqual([120000, 150000]);
    },
};

export const NoBreweriesWithinRadius: Story = {
    render: () => <NearbyBreweriesEmptyHarness />,
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await waitFor(
            () => expect(canvas.getByText(/no partner breweries within/i)).toBeInTheDocument(),
            { timeout: 3000 },
        );
    },
};
