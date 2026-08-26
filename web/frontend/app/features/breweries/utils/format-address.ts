import type { BreweryLocation } from '../breweries.server';

export const formatBreweryAddress = (location: BreweryLocation): string => {
    const streetLine = location.addressLine2
        ? `${location.addressLine1}, ${location.addressLine2}`
        : location.addressLine1;

    return `${streetLine}, ${location.cityName}, ${location.stateProvinceCode} ${location.postalCode}, ${location.countryName}`;
};
