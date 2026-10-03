import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import type { Brewery, BreweryLocation } from '../../breweries/breweries.server';
import PartnerBreweries from './PartnerBreweries';

const partnerBreweriesDescription = `Landing page preview of the three most recently added breweries. Falls back to the empty-state line when the directory is empty or the brewery service is unreachable.`;

const halifaxLocation: BreweryLocation = {
    breweryPostLocationId: 'loc-1',
    breweryPostId: 'brewery-1',
    cityId: 'city-1',
    cityName: 'Halifax',
    stateProvinceName: 'Nova Scotia',
    stateProvinceCode: 'NS',
    countryName: 'Canada',
    countryCode: 'CA',
    addressLine1: '12 Lower Water Street',
    addressLine2: null,
    postalCode: 'B3J 1S3',
    coordinates: { latitude: 44.6488, longitude: -63.5752 },
};

const harbourline: Brewery = {
    breweryPostId: 'brewery-1',
    postedById: 'user-1',
    breweryName: 'Harbourline Brewing',
    description: 'Crisp lagers and a rotating sour program, a short walk from the waterfront.',
    createdAt: '2024-05-01T12:00:00.000Z',
    updatedAt: null,
    location: halifaxLocation,
};

const oldMill: Brewery = {
    breweryPostId: 'brewery-2',
    postedById: 'user-2',
    breweryName: 'Old Mill Ale Works',
    description: 'Cask ales and English bitters brewed in a restored 1880s grain mill.',
    createdAt: '2024-04-18T09:30:00.000Z',
    updatedAt: null,
    location: {
        ...halifaxLocation,
        breweryPostId: 'brewery-2',
        cityName: 'Guelph',
        stateProvinceName: 'Ontario',
        stateProvinceCode: 'ON',
    },
};

const cedarAndHop: Brewery = {
    breweryPostId: 'brewery-3',
    postedById: 'user-3',
    breweryName: 'Cedar & Hop',
    description: 'A pop-up taproom that has not added a storefront location yet.',
    createdAt: '2024-04-02T18:00:00.000Z',
    updatedAt: null,
    location: null,
};

const meta = {
    title: 'Home/PartnerBreweries',
    component: PartnerBreweries,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: partnerBreweriesDescription,
            },
        },
    },
} satisfies Meta<typeof PartnerBreweries>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithBreweries: Story = {
    args: { breweries: [harbourline, oldMill, cedarAndHop] },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(
            canvas.getByRole('heading', { name: 'Discover our partner breweries' }),
        ).toBeInTheDocument();
        await expect(canvas.getByRole('link', { name: /view all breweries/i })).toHaveAttribute(
            'href',
            '/breweries',
        );

        const links = canvas.getAllByRole('link', { name: 'View brewery' });
        await expect(links).toHaveLength(3);
        await expect(links[0]).toHaveAttribute('href', '/breweries/brewery-1');

        // see HOME_HANDOFF.md — the counts are filler until the beers API exists.
        await expect(canvas.getByText('14 beers')).toBeInTheDocument();
    },
};

export const Empty: Story = {
    args: { breweries: [] },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(canvas.getByText('No breweries have been posted yet.')).toBeInTheDocument();
        await expect(canvas.queryByRole('link', { name: 'View brewery' })).not.toBeInTheDocument();
    },
};
