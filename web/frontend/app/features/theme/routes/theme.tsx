import ThemeSwitcher from '../components/ThemeSwitcher';
import type { Route } from './+types/theme';

export const meta = ({}: Route.MetaArgs) => {
    return [
        { title: 'Theme | The Biergarten App' },
        {
            name: 'description',
            content: 'Theme guide and switcher for The Biergarten App',
        },
    ];
};

const ThemePage = () => {
    return (
        <main className="min-h-screen bg-base-200 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
                <ThemeSwitcher />

                <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <div className="card border border-base-300 bg-base-100 shadow-lg">
                        <div className="card-body">
                            <h3 className="card-title">Brand colors</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm font-medium">
                                <div className="rounded-box bg-primary p-3 text-primary-content">
                                    Primary
                                </div>
                                <div className="rounded-box bg-secondary p-3 text-secondary-content">
                                    Secondary
                                </div>
                                <div className="rounded-box bg-accent p-3 text-accent-content">
                                    Accent
                                </div>
                                <div className="rounded-box bg-neutral p-3 text-neutral-content">
                                    Neutral
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card border border-base-300 bg-base-100 shadow-lg">
                        <div className="card-body">
                            <h3 className="card-title">Status colors</h3>
                            <div className="space-y-2 text-sm font-medium">
                                <div className="rounded-box bg-info p-3 text-info-content">
                                    Info
                                </div>
                                <div className="rounded-box bg-success p-3 text-success-content">
                                    Success
                                </div>
                                <div className="rounded-box bg-warning p-3 text-warning-content">
                                    Warning
                                </div>
                                <div className="rounded-box bg-error p-3 text-error-content">
                                    Error
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card border border-base-300 bg-base-100 shadow-lg md:col-span-2 xl:col-span-1">
                        <div className="card-body">
                            <h3 className="card-title">Core style outline</h3>
                            <ul className="list list-disc space-y-2 pl-5 text-base-content/80">
                                <li>Warm serif headings paired with clear sans-serif body text</li>
                                <li>Rounded, tactile surfaces with subtle depth and grain</li>
                                <li>
                                    Semantic token usage to keep contrast consistent in both themes
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="card border border-base-300 bg-base-100 shadow-xl">
                    <div className="card-body gap-4">
                        <h2 className="card-title text-2xl">Component preview</h2>
                        <div className="flex flex-wrap gap-3">
                            <button className="btn btn-primary">Primary action</button>
                            <button className="btn btn-secondary">Secondary action</button>
                            <button className="btn btn-accent">Accent action</button>
                            <button className="btn btn-ghost">Ghost action</button>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                            <div role="alert" className="alert alert-success alert-soft">
                                <span>Theme tokens are applied consistently.</span>
                            </div>
                            <div role="alert" className="alert alert-warning alert-soft">
                                <span>Use semantic colors over hard-coded color values.</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
};

export default ThemePage;
