// see BREWERY_HANDOFF.md — filler data pending backend support for
// beers-by-brewery, likes, ratings, comments, and brewery founded/type/website fields.

export interface FillerBeer {
    id: string;
    name: string;
    description: string;
    style: string;
    abv: number;
    rating: number;
}

export const FILLER_BEERS: FillerBeer[] = [
    {
        id: '1',
        name: 'Switchyard IPA',
        description: 'Flagship west coast IPA, pine and grapefruit',
        style: 'IPA',
        abv: 6.8,
        rating: 4,
    },
    {
        id: '2',
        name: 'Rail Spur DIPA',
        description: 'Double dry-hopped, citra and mosaic',
        style: 'IPA',
        abv: 8.2,
        rating: 5,
    },
    {
        id: '3',
        name: 'Kettle Row Hazy',
        description: 'Soft, juicy, low bitterness',
        style: 'IPA',
        abv: 6.4,
        rating: 4,
    },
    {
        id: '4',
        name: 'Flanders No. 3',
        description: 'Barrel-aged flanders red, 18 months in oak',
        style: 'Sour',
        abv: 6.0,
        rating: 5,
    },
    {
        id: '5',
        name: 'Blackberry Cassis Gose',
        description: 'Collab with Cassis & Coal, lightly salted',
        style: 'Sour',
        abv: 4.6,
        rating: 4,
    },
    {
        id: '6',
        name: 'Foudre Kriek',
        description: 'Whole cherries, second-use barrels',
        style: 'Sour',
        abv: 5.4,
        rating: 4,
    },
    {
        id: '7',
        name: 'Yard Lamp Lager',
        description: 'Crisp helles-style lager',
        style: 'Lager',
        abv: 4.9,
        rating: 4,
    },
    {
        id: '8',
        name: 'Night Shift Stout',
        description: 'Export stout with roasted barley',
        style: 'Stout',
        abv: 7.1,
        rating: 4,
    },
    {
        id: '9',
        name: 'Hefeweizen Classic',
        description: 'Banana and clove, open fermentation',
        style: 'Weizen',
        abv: 5.2,
        rating: 3,
    },
];

export interface FillerComment {
    id: string;
    user: string;
    initials: string;
    rating: number;
    time: string;
    text: string;
    likes: number;
    liked: boolean;
}

export const FILLER_COMMENTS: FillerComment[] = [
    {
        id: '1',
        user: 'malt_kettle',
        initials: 'MK',
        rating: 5,
        time: '2 days ago',
        text: 'The barrel-aged flanders red is worth the trip alone. Staff walked us through the whole sour program on the Saturday tour.',
        likes: 12,
        liked: false,
    },
    {
        id: '2',
        user: 'stoutfan_88',
        initials: 'SB',
        rating: 4,
        time: '1 week ago',
        text: 'Great IPAs, solid taproom. Gets crowded after 7pm on weekends — go early if you want a seat in the barrel room.',
        likes: 5,
        liked: false,
    },
    {
        id: '3',
        user: 'ale_annie',
        initials: 'AL',
        rating: 4,
        time: '3 weeks ago',
        text: 'Their cassis gose collab with Cassis & Coal is still on tap. Slightly pricey flights, but generous pours.',
        likes: 3,
        liked: false,
    },
];

export interface FillerBreweryMeta {
    foundedYear: number;
    type: string;
    website: string;
    likeCount: number;
    avgRating: number;
    ratingsCount: number;
}

export const FILLER_BREWERY_META: FillerBreweryMeta = {
    foundedYear: 2014,
    type: 'Microbrewery',
    website: 'example.com',
    likeCount: 127,
    avgRating: 4,
    ratingsCount: 76,
};
