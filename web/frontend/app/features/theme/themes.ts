export type ThemeName =
   | 'biergarten-lager'
   | 'biergarten-stout'
   | 'biergarten-cassis'
   | 'biergarten-weizen';

export interface ThemeOption {
   value: ThemeName;
   label: string;
   vibe: string;
}

export const defaultThemeName: ThemeName = 'biergarten-lager';
export const themeStorageKey = 'biergarten-theme';

export const biergartenThemes: ThemeOption[] = [
   {
      value: 'biergarten-lager',
      label: 'Biergarten Lager',
      vibe: 'Muted parchment, mellow amber, daytime beer garden',
   },
   {
      value: 'biergarten-stout',
      label: 'Biergarten Stout',
      vibe: 'Charred barrel, deep roast, cozy evening cellar',
   },
   {
      value: 'biergarten-cassis',
      label: 'Biergarten Cassis',
      vibe: 'Blackberry barrel, sour berry dark, vivid night market',
   },
   {
      value: 'biergarten-weizen',
      label: 'Biergarten Weizen',
      vibe: 'Ultra-light young barley, green undertone, bright spring afternoon',
   },
];

export const isBiergartenTheme = (value: string | null | undefined): value is ThemeName => {
   return biergartenThemes.some((theme) => theme.value === value);
};
