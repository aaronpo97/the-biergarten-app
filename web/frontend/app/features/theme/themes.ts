export type ThemeName =
    'biergarten-lager' | 'biergarten-stout' | 'biergarten-cassis' | 'biergarten-weizen';

export interface ThemeOption {
    value: ThemeName;
    label: string;
    /** Used where the segmented control is narrow, such as the landing page. */
    shortLabel: string;
    /** A compact mood descriptor for theme pickers. */
    shortVibe: string;
    vibe: string;
}

export const defaultThemeName: ThemeName = 'biergarten-lager';
export const themeCookieName = 'biergarten-theme';

export const biergartenThemes: ThemeOption[] = [
    {
        value: 'biergarten-lager',
        label: 'Biergarten Lager',
        shortLabel: 'Lager',
        shortVibe: 'Muted parchment',
        vibe: 'Muted parchment, mellow amber, daytime beer garden',
    },
    {
        value: 'biergarten-stout',
        label: 'Biergarten Stout',
        shortLabel: 'Stout',
        shortVibe: 'Charred barrel',
        vibe: 'Charred barrel, deep roast, cozy evening cellar',
    },
    {
        value: 'biergarten-cassis',
        label: 'Biergarten Cassis',
        shortLabel: 'Cassis',
        shortVibe: 'Blackberry barrel',
        vibe: 'Blackberry barrel, sour berry dark, vivid night market',
    },
    {
        value: 'biergarten-weizen',
        label: 'Biergarten Weizen',
        shortLabel: 'Weizen',
        shortVibe: 'Bright spring',
        vibe: 'Ultra-light young barley, green undertone, bright spring afternoon',
    },
];

export const isBiergartenTheme = (value: string | null | undefined): value is ThemeName => {
    return biergartenThemes.some((theme) => theme.value === value);
};

export const parseThemeCookie = (cookieHeader: string | null): ThemeName => {
    const match = cookieHeader?.match(new RegExp(`(?:^|; )${themeCookieName}=([^;]*)`));
    const value = match ? decodeURIComponent(match[1]) : null;
    return isBiergartenTheme(value) ? value : defaultThemeName;
};
