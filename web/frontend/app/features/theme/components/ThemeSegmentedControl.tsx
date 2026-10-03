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
    className = 'join join-vertical sm:join-horizontal',
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
                        className={`btn join-item ${checked ? 'btn-primary' : 'btn-outline'}`}
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
                        {labels === 'short' ? theme.shortLabel : theme.label}
                    </label>
                );
            })}
        </div>
    );
};

export default ThemeSegmentedControl;
