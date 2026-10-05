import { useState } from 'react';
import { useRouteLoaderData } from 'react-router';
import type { loader as rootLoader } from '../../../root';
import { biergartenThemes, defaultThemeName, themeCookieName, type ThemeName } from '../themes';

// The semantic aliases resolve at :root, so the attribute has to land on <html>
// rather than a nested element for the whole document to switch.
const applyTheme = (theme: ThemeName) => {
    document.documentElement.setAttribute('data-theme', theme);
    document.cookie = `${themeCookieName}=${theme}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
};

interface ThemeSegmentedControlProps {
    /** `short` renders "Lager"; `full` renders "Biergarten Lager". */
    labels?: 'full' | 'short';
    className?: string;
    onChange?: (theme: ThemeName) => void;
}

const ThemeSegmentedControl = ({
    labels = 'full',
    className = 'grid grid-cols-2 gap-2',
    onChange,
}: ThemeSegmentedControlProps) => {
    const rootTheme = useRouteLoaderData<typeof rootLoader>('root')?.theme ?? defaultThemeName;
    const [selectedTheme, setSelectedTheme] = useState<ThemeName>(rootTheme);

    return (
        <div className={className} role="radiogroup" aria-label="Theme selector">
            {biergartenThemes.map((theme) => {
                const checked = selectedTheme === theme.value;

                return (
                    <label
                        key={theme.value}
                        className={`group flex min-h-20 cursor-pointer items-center gap-3 rounded-box border p-3 text-left transition-all duration-200 ${
                            checked
                                ? 'border-primary bg-primary text-primary-content shadow-md'
                                : 'border-base-content/15 bg-base-200/45 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-base-200'
                        }`}
                    >
                        <input
                            type="radio"
                            name="theme"
                            value={theme.value}
                            className="sr-only"
                            checked={checked}
                            onChange={() => {
                                setSelectedTheme(theme.value);
                                applyTheme(theme.value);
                                onChange?.(theme.value);
                            }}
                        />
                        <span
                            aria-hidden="true"
                            className={`size-9 shrink-0 rounded-full border-4 shadow-inner transition-transform duration-200 group-hover:scale-105 ${
                                checked ? 'border-primary-content/70' : 'border-base-100'
                            }`}
                            style={{
                                background:
                                    theme.value === 'biergarten-lager'
                                        ? 'linear-gradient(135deg, #f5c451 0%, #a96728 100%)'
                                        : theme.value === 'biergarten-stout'
                                          ? 'linear-gradient(135deg, #d69b45 0%, #382116 100%)'
                                          : theme.value === 'biergarten-cassis'
                                            ? 'linear-gradient(135deg, #c777b9 0%, #4c214e 100%)'
                                            : 'linear-gradient(135deg, #f7e6a5 0%, #82a85d 100%)',
                            }}
                        />
                        <span className="min-w-0">
                            <span className="block truncate text-sm font-bold">
                                {labels === 'short' ? theme.shortLabel : theme.label}
                            </span>
                            <span
                                className={`mt-0.5 block truncate text-xs ${
                                    checked ? 'text-primary-content/75' : 'text-base-content/60'
                                }`}
                            >
                                {theme.shortVibe}
                            </span>
                        </span>
                    </label>
                );
            })}
        </div>
    );
};

export default ThemeSegmentedControl;
