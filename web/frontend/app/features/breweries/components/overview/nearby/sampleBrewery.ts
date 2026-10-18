import type { SimplifiedBrewery } from '../../../breweries.server';

export const sampleBrewery: SimplifiedBrewery = {
    breweryPostId: 'brewery-close',
    breweryName: 'Close Quarters Brewing',
    distanceMetres: null,
    location: {
        breweryPostLocationId: 'location-close',
        breweryPostId: 'brewery-close',
        cityId: 'city-portland',
        cityName: 'Portland',
        stateProvinceName: 'Oregon',
        stateProvinceCode: 'OR',
        countryName: 'United States',
        countryCode: 'US',
        addressLine1: '123 Hops Street',
        addressLine2: null,
        postalCode: '97201',
        coordinates: { latitude: 45.52, longitude: -122.68 },
    },
};
