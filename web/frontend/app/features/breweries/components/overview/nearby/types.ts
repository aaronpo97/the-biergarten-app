import type { SimplifiedBrewery } from '../../../breweries.server';

export interface BreweryWithDistance {
    brewery: SimplifiedBrewery;
    distanceMetres: number;
}
