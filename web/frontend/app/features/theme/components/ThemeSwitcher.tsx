import { useState } from 'react';
import {
    biergartenThemes,
    defaultThemeName,
    isBiergartenTheme,
    type ThemeName,
    themeStorageKey,
} from '../themes';

const applyTheme = (theme: ThemeName) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(themeStorageKey, theme);
};

const ThemeSwitcher = () => {
    const [selectedTheme, setSelectedTheme] = useState<ThemeName>(() => {
        if (typeof window === 'undefined') {
            return defaultThemeName;
        }

        const savedTheme = localStorage.getItem(themeStorageKey);
        return isBiergartenTheme(savedTheme) ? savedTheme : defaultThemeName;
    });

    const activeTheme =
        biergartenThemes.find((theme) => theme.value === selectedTheme) ?? biergartenThemes[0];

    return (
        <>
            <section className="card border border-base-300 bg-base-100 shadow-xl">
                <div className="card-body gap-4">
                    <h1 className="card-title text-3xl sm:text-4xl">Theme Guide</h1>
                    <p className="text-base-content/70">
                        Four themes, four moods — from the sun-bleached clarity of a Weizen
                        afternoon to the deep berry dark of a Cassis barrel. Every theme shares the
                        same semantic token structure so components stay consistent while the
                        atmosphere shifts completely.
                    </p>
                    <div className="alert alert-info alert-soft">
                        <span>
                            Active theme: <strong>{activeTheme.label}</strong> — {activeTheme.vibe}
                        </span>
                    </div>
                </div>
            </section>

            <section className="card border border-base-300 bg-base-100 shadow-xl">
                <div className="card-body gap-4">
                    <h2 className="card-title text-2xl">Theme switcher</h2>
                    <p className="text-base-content/70">
                        Pick a theme and preview it immediately.
                    </p>

                    <div
                        className="join join-vertical sm:join-horizontal"
                        role="radiogroup"
                        aria-label="Theme selector"
                    >
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
                                        }}
                                    />
                                    {theme.label}
                                </label>
                            );
                        })}
                    </div>
                </div>
            </section>
        </>
    );
};

export default ThemeSwitcher;
